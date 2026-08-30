/**
 * BullMQ queue definitions and enqueue helpers (Phase 21, spec §8: "Use
 * BullMQ for: Weather synchronization, Market synchronization,
 * Notifications, Disease risk calculation, Heavy AI jobs").
 *
 * Queues are created here (used by the API process to enqueue work);
 * the matching Worker instances that actually process jobs live in
 * ../workers and only run in the separate worker process (src/worker.ts)
 * — the API process never processes jobs itself, so a slow job can never
 * block a farmer-facing HTTP request.
 *
 * Every enqueue helper is best-effort: if Redis is down, the job is
 * dropped and a warning is logged rather than throwing, so a queue
 * outage degrades gracefully (per spec §18 "Redis failure ... degrade
 * gracefully") instead of failing the request that triggered it.
 */
import { Queue } from "bullmq";
import { queueConnection } from "../config/queueConnection";
import { logger } from "../utils/logger";
import { QUEUE_NAMES } from "./queueNames";
import { CreateNotificationInput } from "../services/notification.service";

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 5000 },
  removeOnComplete: { age: 24 * 60 * 60, count: 1000 },
  removeOnFail: { age: 7 * 24 * 60 * 60 },
};

export const notificationQueue = new Queue(QUEUE_NAMES.notifications, {
  connection: queueConnection,
  defaultJobOptions,
});

export const knowledgeIngestionQueue = new Queue(QUEUE_NAMES.knowledgeIngestion, {
  connection: queueConnection,
  defaultJobOptions: { ...defaultJobOptions, attempts: 2 },
});

export const weatherSyncQueue = new Queue(QUEUE_NAMES.weatherSync, { connection: queueConnection });
export const marketSyncQueue = new Queue(QUEUE_NAMES.marketSync, { connection: queueConnection });
export const diseaseRiskSyncQueue = new Queue(QUEUE_NAMES.diseaseRiskSync, { connection: queueConnection });

async function safeAdd(queue: Queue, jobName: string, data: unknown): Promise<void> {
  try {
    await queue.add(jobName, data);
  } catch (err) {
    logger.warn(`Failed to enqueue job on ${queue.name}, continuing without it`, { jobName, err });
  }
}

export async function enqueueNotification(input: CreateNotificationInput): Promise<void> {
  await safeAdd(notificationQueue, "deliver", input);
}

export async function enqueueKnowledgeIngestion(documentId: string): Promise<void> {
  await safeAdd(knowledgeIngestionQueue, "ingest", { documentId });
}
