import { redisConnection } from "../config/redis.js";

/**
 * Generic cache wrapper on top of the shared Redis connection.
 * Used to cache: document status polling responses, chat history pages,
 * and summary reads — all read-heavy, write-light data.
 */
export const cacheService = {
  async get(key) {
    const val = await redisConnection.get(key);
    return val ? JSON.parse(val) : null;
  },
  async set(key, value, ttlSeconds = 60) {
    await redisConnection.set(key, JSON.stringify(value), "EX", ttlSeconds);
  },
  async del(key) {
    await redisConnection.del(key);
  },
  async delByPrefix(prefix) {
    const keys = await redisConnection.keys(`${prefix}*`);
    if (keys.length) await redisConnection.del(...keys);
  },
};
