import Summary from "../models/Summary.js";
import { documentRepository } from "../repositories/document.repository.js";
import { chunkRepository } from "../repositories/chunk.repository.js";
import { summaryQueue } from "../queues/summaryQueue.js";
import { ApiError } from "../utils/apiResponse.js";
import { cacheService } from "./cache.service.js";

export const summaryService = {
  async requestSummary(documentId, ownerId) {
    const doc = await documentRepository.findByIdForOwner(documentId, ownerId);
    if (!doc) throw new ApiError(404, "Document not found");
    if (doc.status !== "ready") throw new ApiError(409, "Document is still processing. Try again shortly.");

    const existing = await Summary.findOne({ document: documentId });
    if (existing && existing.status === "ready") return existing;

    await Summary.findOneAndUpdate(
      { document: documentId },
      { document: documentId, owner: ownerId, status: "pending" },
      { upsert: true }
    );

    await summaryQueue.add("generate-summary", { documentId }, { attempts: 2 });
    return { status: "pending" };
  },

  async getSummary(documentId, ownerId) {
    const cacheKey = `summary:${documentId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const summary = await Summary.findOne({ document: documentId, owner: ownerId });
    if (!summary) throw new ApiError(404, "No summary requested for this document yet");

    if (summary.status === "ready") await cacheService.set(cacheKey, summary, 300);
    return summary;
  },
};
