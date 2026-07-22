import path from "path";
import { documentRepository } from "../repositories/document.repository.js";
import { chunkRepository } from "../repositories/chunk.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { pdfQueue } from "../queues/pdfQueue.js";
import { ApiError } from "../utils/apiResponse.js";
import { cacheService } from "./cache.service.js";

export const documentService = {
  async uploadDocument({ ownerId, file }) {
    const document = await documentRepository.create({
      owner: ownerId,
      originalName: file.originalname,
      storageKey: path.basename(file.path),
      fileSizeBytes: file.size,
      status: "queued",
    });

    // Enqueue instead of processing inline — extraction + embedding of a
    // large PDF can take 10-60s, well past what an HTTP client should wait on.
    await pdfQueue.add(
      "process-pdf",
      { documentId: document._id.toString(), filePath: file.path },
      { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
    );

    await userRepository.incrementDocumentCount(ownerId);
    await cacheService.delByPrefix(`docs:${ownerId}`);

    return document;
  },

  async getStatus(documentId, ownerId) {
    const cacheKey = `doc-status:${documentId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const doc = await documentRepository.findByIdForOwner(documentId, ownerId);
    if (!doc) throw new ApiError(404, "Document not found");

    const payload = {
      id: doc._id,
      status: doc.status,
      pageCount: doc.pageCount,
      chunkCount: doc.chunkCount,
      failureReason: doc.failureReason,
    };

    // Short TTL: status changes as the worker progresses, so we don't
    // want a stale "processing" cached while polling for "ready".
    await cacheService.set(cacheKey, payload, 5);
    return payload;
  },

  async listDocuments(ownerId, pagination) {
    const cacheKey = `docs:${ownerId}:${pagination.page}:${pagination.limit}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const [items, total] = await Promise.all([
      documentRepository.listByOwner(ownerId, pagination),
      documentRepository.countByOwner(ownerId),
    ]);

    const payload = { items, total, page: pagination.page, limit: pagination.limit };
    await cacheService.set(cacheKey, payload, 30);
    return payload;
  },

  async deleteDocument(documentId, ownerId) {
    const doc = await documentRepository.findByIdForOwner(documentId, ownerId);
    if (!doc) throw new ApiError(404, "Document not found");

    await chunkRepository.deleteByDocument(documentId);
    await documentRepository.delete(documentId);
    await cacheService.delByPrefix(`docs:${ownerId}`);
    await cacheService.del(`doc-status:${documentId}`);
  },
};
