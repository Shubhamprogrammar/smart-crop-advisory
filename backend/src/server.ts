import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectDB, disconnectDB } from "./config/db";
import { connectRedis, redis } from "./config/redis";
import { Server } from "http";

let server: Server;

async function start() {
  await connectDB();
  await connectRedis();

  server = app.listen(env.PORT, () => {
    logger.info(`Backend API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);
  server?.close(async () => {
    await disconnectDB();
    redis.disconnect();
    logger.info("Server closed");
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { err });
  process.exit(1);
});

start().catch((err) => {
  logger.error("Failed to start server", { err });
  process.exit(1);
});
