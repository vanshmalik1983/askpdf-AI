/**
 * Cosine similarity between two equal-length embedding vectors.
 * Used both for in-memory re-ranking of Mongo Atlas Vector Search
 * results and for confidence scoring shown to the user.
 */
export function cosineSimilarity(vecA, vecB) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
