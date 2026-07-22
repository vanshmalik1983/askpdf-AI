import mongoose from "mongoose";

/**
 * Mirrors BullMQ job state into Mongo for user-facing status polling
 * and audit history. BullMQ/Redis is the source of truth for execution;
 * this collection is a queryable, persistent record of outcomes —
 * Redis job data expires/gets trimmed, this doesn't.
 */
const queueJobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, index: true }, // BullMQ job id
    queueName: { type: String, required: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    status: { type: String, enum: ["pending", "active", "completed", "failed"], default: "pending" },
    attempts: { type: Number, default: 0 },
    errorMessage: { type: String },
    startedAt: { type: Date },
    finishedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("QueueJob", queueJobSchema);
