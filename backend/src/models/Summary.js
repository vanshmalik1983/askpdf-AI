import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    overallSummary: { type: String },
    pageSummaries: [
      {
        pageNumber: Number,
        summary: String,
        _id: false,
      },
    ],
    status: { type: String, enum: ["pending", "ready", "failed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Summary", summarySchema);
