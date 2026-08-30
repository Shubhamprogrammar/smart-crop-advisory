/**
 * Manually enqueues a one-off run of a background sync job, without
 * waiting for its scheduled interval (worker.ts) — useful for verifying
 * a sync job works right after deploying it, or forcing a refresh on
 * demand (e.g. after seeding new farms in a fresh environment).
 *
 * Run: npx tsx src/scripts/triggerSync.ts <weather|market|disease-risk|all>
 */
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { weatherSyncQueue, marketSyncQueue, diseaseRiskSyncQueue } from "../queues";

const JOB_QUEUES = {
  weather: weatherSyncQueue,
  market: marketSyncQueue,
  "disease-risk": diseaseRiskSyncQueue,
} as const;

async function main() {
  void env; // ensures env validation runs before touching Redis
  const target = process.argv[2];

  if (!target || (target !== "all" && !(target in JOB_QUEUES))) {
    logger.error("Usage: npx tsx src/scripts/triggerSync.ts <weather|market|disease-risk|all>");
    process.exit(1);
  }

  const queues = target === "all" ? Object.values(JOB_QUEUES) : [JOB_QUEUES[target as keyof typeof JOB_QUEUES]];

  for (const queue of queues) {
    await queue.add("sync-all", {});
    logger.info(`Enqueued a one-off "${queue.name}" job`);
  }

  // Give BullMQ a moment to flush the ADD command before the process exits.
  await new Promise((resolve) => setTimeout(resolve, 500));
  process.exit(0);
}

main().catch((err) => {
  logger.error("Failed to trigger sync job", { err });
  process.exit(1);
});
