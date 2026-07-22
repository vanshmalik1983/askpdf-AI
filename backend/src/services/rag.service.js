import { chunkRepository } from "../repositories/chunk.repository.js";
import { embeddingService } from "./embedding.service.js";
import { geminiService } from "./gemini.service.js";
import { cosineSimilarity } from "../utils/similarity.js";
import { env } from "../config/env.js";
import { NO_ANSWER_MESSAGE } from "../utils/constants.js";

/**
 * The RAG pipeline: question -> embedding -> retrieval -> threshold
 * filter -> prompt construction -> generation -> citations.
 *
 * Retrieval strategy note: this reads all chunk vectors for the
 * document and ranks them in-memory with cosine similarity. That's
 * fine at chunk counts a single PDF produces (dozens to a few hundred).
 * In production this aggregation is replaced by a MongoDB Atlas
 * $vectorSearch stage (HNSW index) so ranking happens server-side and
 * scales past what fits comfortably in app memory — see
 * docs/06-rag-and-embeddings.md for the migration path.
 */
export const ragService = {
  async answerQuestion({ documentId, question }) {
    const queryEmbedding = await embeddingService.embedQuery(question);

    const chunks = await chunkRepository.findEmbeddingsByDocument(documentId);
    if (chunks.length === 0) {
      return { answer: NO_ANSWER_MESSAGE, citations: [], confidenceScore: 0, isFallback: true };
    }

    const ranked = chunks
      .map((c) => ({ ...c, score: cosineSimilarity(queryEmbedding, c.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, env.topKChunks);

    // Hallucination guard: if even the best-matching chunk falls below
    // the threshold, the document likely doesn't contain the answer —
    // we short-circuit instead of letting Gemini improvise from weak context.
    const relevant = ranked.filter((c) => c.score >= env.similarityThreshold);
    if (relevant.length === 0) {
      return { answer: NO_ANSWER_MESSAGE, citations: [], confidenceScore: ranked[0]?.score ?? 0, isFallback: true };
    }

    const answer = await geminiService.generateAnswer({ question, contextChunks: relevant });

    const citations = relevant.map((c) => ({
      chunk: c._id,
      pageNumber: c.pageNumber,
      snippet: c.text.slice(0, 180),
      score: Number(c.score.toFixed(3)),
    }));

    const confidenceScore = Number(
      (relevant.reduce((sum, c) => sum + c.score, 0) / relevant.length).toFixed(3)
    );

    return { answer, citations, confidenceScore, isFallback: false };
  },
};
