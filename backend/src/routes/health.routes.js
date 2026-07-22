import { Router } from "express";
import mongoose from "mongoose";
import { redisConnection } from "../config/redis.js";
import { success } from "../utils/apiResponse.js";

const router = Router();

router.get("/", async (req, res) => {
  const mongoState = mongoose.connection.readyState === 1 ? "up" : "down";
  const redisState = redisConnection.status === "ready" ? "up" : "down";
  const healthy = mongoState === "up" && redisState === "up";

  return success(res, healthy ? 200 : 503, "Health check", {
    mongo: mongoState,
    redis: redisState,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

export default router;
