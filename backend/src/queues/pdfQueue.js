import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { QUEUE_NAMES } from "../utils/constants.js";

export const pdfQueue = new Queue(QUEUE_NAMES.PDF_PROCESSING, { connection: redisConnection });
