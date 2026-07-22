import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    refreshTokenHash: { type: String, select: false }, // rotated on each refresh; lets us invalidate on logout
    role: { type: String, enum: ["user", "admin"], default: "user" },
    documentCount: { type: Number, default: 0 }, // denormalized for quick quota checks without a COUNT query
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
