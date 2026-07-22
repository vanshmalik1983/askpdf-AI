import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalName: { type: String, required: true },
    storageKey: { type: String, required: true }, // path/key on disk or object storage
    fileSizeBytes: { type: Number, required: true },
    pageCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["uploaded", "queued", "processing", "ready", "failed"],
      default: "uploaded",
      index: true,
    },
    failureReason: { type: String },
    chunkCount: { type: Number, default: 0 },
    processingStartedAt: { type: Date },
    processingCompletedAt: { type: Date },
  },
  { timestamps: true }
);

// Most common query: "give me this user's documents, newest first"
documentSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model("Document", documentSchema);
