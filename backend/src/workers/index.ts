import { Worker } from "bullmq";
import { logger } from "../utils/logger";
import { weatherSyncQueue, marketSyncQueue, diseaseRiskSyncQueue } from "../queues";
import { startNotificationWorker } from "./notification.worker";
import { startKnowledgeIngestionWorker } from "./knowledgeIngestion.worker";
import { startWeatherSyncWorker } from "./weatherSync.worker";
import { startMarketSyncWorker } from "./marketSync.worker";
import { startDiseaseRiskSyncWorker } from "./diseaseRiskSync.worker";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/**
 * Registers the repeatable "sync all" jobs. upsertJobScheduler is
 * idempotent on jobSchedulerId, so calling this on every worker-process
 * boot doesn't create duplicate schedules.
 */
async function scheduleRepeatableJobs(): Promise<void> {
  // Slightly under the weather cache's own 30-minute TTL (Phase 5) so the
  // cache is refreshed just before it would otherwise expire.
  await weatherSyncQueue.upsertJobScheduler(
    "weather-sync-schedule",
    { every: 25 * MINUTE, immediately: true },
    { name: "sync-all" }
  );
  await marketSyncQueue.upsertJobScheduler(
    "market-sync-schedule",
    { every: DAY, immediately: true },
    { name: "sync-all" }
  );
  await diseaseRiskSyncQueue.upsertJobScheduler(
    "disease-risk-sync-schedule",
    { every: DAY, immediately: true },
    { name: "sync-all" }
  );
}

export async function startWorkers(): Promise<Worker[]> {
  const workers = [
    startNotificationWorker(),
    startKnowledgeIngestionWorker(),
    startWeatherSyncWorker(),
    startMarketSyncWorker(),
    startDiseaseRiskSyncWorker(),
  ];

  await scheduleRepeatableJobs();

  logger.info(`${workers.length} worker(s) started; repeatable sync jobs scheduled`);
  return workers;
}
