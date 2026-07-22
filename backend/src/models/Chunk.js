import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    pageNumber: { type: Number, required: true },
    chunkIndex: { type: Number, required: true }, // order within the document, for citation display
    text: { type: String, required: true },
    embedding: { type: [Number], required: true }, // 768-dim vector from text-embedding-004
  },
  { timestamps: true }
);

// Compound index supports "fetch all chunks for a document in order"
chunkSchema.index({ document: 1, chunkIndex: 1 });

/**
 * In production this collection lives in MongoDB Atlas with a Vector
 * Search index defined on `embedding` (cosine similarity, 768 dims),
 * scoped per-document via a filter on `document`. Local/dev fallback
 * uses in-memory cosine similarity — see rag.service.js.
 */
export default mongoose.model("Chunk", chunkSchema);
