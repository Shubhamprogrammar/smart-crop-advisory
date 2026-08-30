import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

/**
 * BullMQ requires its own ioredis connection with maxRetriesPerRequest set
 * to null (it manages retries itself via blocking commands) — the app's
 * general-purpose cache client in config/redis.ts is deliberately
 * configured the opposite way (maxRetriesPerRequest: 1, fail fast) so a
 * slow/down Redis never blocks a farmer-facing request. Same Redis
 * server, two connections with different failure-handling contracts.
 */
export const queueConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

queueConnection.on("error", (err) => logger.warn("Queue Redis connection error", { err: err.message }));
