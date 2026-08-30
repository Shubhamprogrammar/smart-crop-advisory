/**
 * Standalone BullMQ worker process (spec §8/§21). Runs separately from
 * the API server (src/server.ts) so a slow or heavy job (knowledge
 * ingestion, disease-risk recomputation across every farm) can never
 * block a farmer-facing HTTP request — the API process only ever
 * enqueues jobs (see src/queues), it never processes them itself.
 *
 * Run: npm run worker (dev, via tsx watch) or node dist/worker.js (prod,
 * same build output as the API server via `npm run build`).
 */
import { Worker } from "bullmq";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectDB, disconnectDB } from "./config/db";
import { connectRedis, redis } from "./config/redis";
import { queueConnection } from "./config/queueConnection";
import { startWorkers } from "./workers";

let workers: Worker[] = [];

async function start() {
  await connectDB();
  await connectRedis();
  workers = await startWorkers();
  logger.info(`Worker process ready [${env.NODE_ENV}]`);
}

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down worker process gracefully`);
  await Promise.all(workers.map((w) => w.close()));
  await disconnectDB();
  redis.disconnect();
  queueConnection.disconnect();
  logger.info("Worker process closed");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection in worker process", { reason });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception in worker process", { err });
  process.exit(1);
});

start().catch((err) => {
  logger.error("Failed to start worker process", { err });
  process.exit(1);
});
