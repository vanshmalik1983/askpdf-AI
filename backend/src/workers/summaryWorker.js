import { Worker } from "bullmq";
import { connectDB } from "../config/db.js";
import { redisConnection } from "../config/redis.js";
import { QUEUE_NAMES } from "../utils/constants.js";
import { chunkRepository } from "../repositories/chunk.repository.js";
import { geminiService } from "../services/gemini.service.js";
import Summary from "../models/Summary.js";
import { logger } from "../utils/logger.js";

await connectDB();

const worker = new Worker(
  QUEUE_NAMES.SUMMARY,
  async (job) => {
    const { documentId } = job.data;
    const chunks = await chunkRepository.findByDocument(documentId);

    // Group chunks back into page-level text so summaries read naturally
    // instead of being generated per-chunk (which would fragment context).
    const byPage = {};
    for (const c of chunks) {
      byPage[c.pageNumber] = (byPage[c.pageNumber] || "") + " " + c.text;
    }

    const pageSummaries = [];
    for (const [pageNumber, text] of Object.entries(byPage)) {
      const summary = await geminiService.generateSummary({ pageText: text, pageNumber: Number(pageNumber) });
      pageSummaries.push({ pageNumber: Number(pageNumber), summary });
    }

    const overallSummary = await geminiService.generateSummary({
      pageText: pageSummaries.map((p) => p.summary).join(" "),
      pageNumber: "all",
    });

    await Summary.findOneAndUpdate(
      { document: documentId },
      { overallSummary, pageSummaries, status: "ready" }
    );

    logger.info(`Summary generated for document ${documentId}`);
  },
  { connection: redisConnection, concurrency: 2 }
);

worker.on("failed", async (job, err) => {
  logger.error(`Summary job ${job.id} failed`, err);
  await Summary.findOneAndUpdate({ document: job.data.documentId }, { status: "failed" });
});

logger.info("Summary worker started");
