import { Worker } from "bullmq";
import fs from "fs/promises";
import { connectDB } from "../config/db.js";
import { redisConnection } from "../config/redis.js";
import { QUEUE_NAMES } from "../utils/constants.js";
import { pdfService } from "../services/pdf.service.js";
import { chunkingService } from "../services/chunking.service.js";
import { embeddingService } from "../services/embedding.service.js";
import { documentRepository } from "../repositories/document.repository.js";
import { chunkRepository } from "../repositories/chunk.repository.js";
import QueueJob from "../models/QueueJob.js";
import { logger } from "../utils/logger.js";

await connectDB();

/**
 * Runs the full offline pipeline for one document:
 * extract -> chunk -> embed -> persist -> mark ready.
 *
 * This is a SEPARATE PROCESS from the API server (run via
 * `npm run worker:pdf`), which is the point of the queue: PDF parsing
 * and batch embedding calls are CPU/IO heavy and shouldn't compete
 * with the event loop that's serving HTTP requests.
 */
const worker = new Worker(
  QUEUE_NAMES.PDF_PROCESSING,
  async (job) => {
    const { documentId, filePath } = job.data;
    const startedAt = new Date();

    await documentRepository.updateStatus(documentId, "processing", { processingStartedAt: startedAt });
    await QueueJob.create({ jobId: job.id, queueName: job.queueName, document: documentId, status: "active", startedAt });

    try {
      const { pages, totalPages } = await pdfService.extractPages(filePath);

      const chunkRecords = chunkingService.chunkPages(pages);
      if (chunkRecords.length === 0) {
        throw new Error("No usable text chunks could be extracted from this PDF");
      }

      const embeddings = await embeddingService.embedChunks(chunkRecords.map((c) => c.text));

      const owner = (await documentRepository.findById(documentId)).owner;
      const docsToInsert = chunkRecords.map((c, i) => ({
        document: documentId,
        owner,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        text: c.text,
        embedding: embeddings[i],
      }));
      await chunkRepository.insertMany(docsToInsert);

      await documentRepository.updateStatus(documentId, "ready", {
        pageCount: totalPages,
        chunkCount: docsToInsert.length,
        processingCompletedAt: new Date(),
      });

      await QueueJob.findOneAndUpdate(
        { jobId: job.id },
        { status: "completed", finishedAt: new Date() }
      );

      logger.info(`Document ${documentId} processed: ${docsToInsert.length} chunks`);
    } catch (err) {
      logger.error(`PDF processing failed for ${documentId}`, err);
      await documentRepository.updateStatus(documentId, "failed", { failureReason: err.message });
      await QueueJob.findOneAndUpdate(
        { jobId: job.id },
        { status: "failed", errorMessage: err.message, finishedAt: new Date() }
      );
      throw err; // rethrow so BullMQ applies the configured retry/backoff
    } finally {
      // Clean up the temp upload regardless of outcome to avoid disk bloat.
      await fs.unlink(filePath).catch(() => {});
    }
  },
  { connection: redisConnection, concurrency: 3 } // caps parallel Gemini calls across jobs
);

worker.on("failed", (job, err) => {
  logger.error(`Job ${job.id} exhausted retries`, err);
});

logger.info("PDF worker started");
