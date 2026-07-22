import { geminiService } from "./gemini.service.js";

/**
 * Wraps embedding generation for both directions of the RAG flow:
 * - Indexing time: embed every chunk of an uploaded document
 * - Query time: embed the user's question with the SAME model,
 *   which is required for the vectors to live in a comparable space.
 */
export const embeddingService = {
  embedChunks: (chunkTexts) => geminiService.embedBatch(chunkTexts),
  embedQuery: (question) => geminiService.embedText(question),
};
