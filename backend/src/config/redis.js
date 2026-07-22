import Redis from "ioredis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const redisConnection = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redisConnection.on("connect", () => logger.info("Redis connected"));
redisConnection.on("error", (err) => logger.error("Redis error", err));
