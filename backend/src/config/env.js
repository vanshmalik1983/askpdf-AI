import dotenv from "dotenv";
dotenv.config();

/**
 * Centralized environment config.
 * Fail fast on boot if a required var is missing instead of
 * discovering it later as a cryptic runtime error.
 */
const required = ["MONGO_URI", "REDIS_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "GEMINI_API_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[CONFIG] Missing required env var: ${key}`);
    if (process.env.NODE_ENV === "production") process.exit(1);
  }
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",

  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiChatModel: process.env.GEMINI_CHAT_MODEL || "gemini-1.5-flash",
  geminiEmbedModel: process.env.GEMINI_EMBED_MODEL || "text-embedding-004",

  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 20),
  uploadDir: process.env.UPLOAD_DIR || "uploads",

  chunkSize: Number(process.env.CHUNK_SIZE || 800),
  chunkOverlap: Number(process.env.CHUNK_OVERLAP || 120),
  topKChunks: Number(process.env.TOP_K_CHUNKS || 5),
  similarityThreshold: Number(process.env.SIMILARITY_THRESHOLD || 0.72),
};
