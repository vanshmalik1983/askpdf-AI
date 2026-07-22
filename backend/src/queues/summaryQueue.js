import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { QUEUE_NAMES } from "../utils/constants.js";

export const summaryQueue = new Queue(QUEUE_NAMES.SUMMARY, { connection: redisConnection });
