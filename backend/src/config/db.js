import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 8000,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection failed", err);
    process.exit(1);
  }
}
