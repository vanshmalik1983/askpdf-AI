import mongoose from "mongoose";

const citationSchema = new mongoose.Schema(
  {
    chunk: { type: mongoose.Schema.Types.ObjectId, ref: "Chunk" },
    pageNumber: Number,
    snippet: String,
    score: Number,
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    citations: [citationSchema],
    confidenceScore: { type: Number }, // avg similarity of chunks actually used
    isFallback: { type: Boolean, default: false }, // true when we returned the "not enough info" message
  },
  { timestamps: true }
);

chatSchema.index({ document: 1, createdAt: -1 });

export default mongoose.model("Chat", chatSchema);
