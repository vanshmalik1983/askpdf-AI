import Chunk from "../models/Chunk.js";

export const chunkRepository = {
  insertMany: (chunks) => Chunk.insertMany(chunks, { ordered: false }),
  findByDocument: (documentId) => Chunk.find({ document: documentId }).sort({ chunkIndex: 1 }),
  /**
   * Dev/local fallback retrieval: pulls all chunk vectors for a document
   * so rag.service.js can rank them in-memory with cosine similarity.
   * In production this is replaced by an Atlas $vectorSearch aggregation
   * (see docs/06-rag-and-embeddings.md) which does the ANN search
   * server-side instead of loading every vector into app memory.
   */
  findEmbeddingsByDocument: (documentId) =>
    Chunk.find({ document: documentId }, { text: 1, embedding: 1, pageNumber: 1, chunkIndex: 1 }).lean(),
  deleteByDocument: (documentId) => Chunk.deleteMany({ document: documentId }),
};
