import { Worker } from "bullmq";
import { queueConnection } from "../config/queueConnection";
import { logger } from "../utils/logger";
import { QUEUE_NAMES } from "../queues/queueNames";
import { CropCycle } from "../models/CropCycle.model";
import { Farm } from "../models/Farm.model";
import { computeDiseaseRisk } from "../services/diseaseRisk.service";

/**
 * Recomputes disease risk for every farm with an active crop cycle (spec
 * §8: "Disease risk calculation"). Phase 9 only computed this on demand
 * (a farmer opening their dashboard) — this keeps the assessment fresh
 * automatically, so the advisory engine's diseaseRiskRule (Phase 10)
 * always has a recent value to react to instead of a stale or missing
 * one. Best-effort per farm: one farm's AI-service failure (or a farm
 * with no weather data yet) doesn't stop the rest of the batch.
 */
async function syncAllDiseaseRisk(): Promise<void> {
  const farmIds = await CropCycle.distinct("farm", { status: "active" });
  const farms = await Farm.find({ _id: { $in: farmIds } }, { owner: 1 });

  let succeeded = 0;
  for (const farm of farms) {
    try {
      await computeDiseaseRisk(farm._id.toString(), farm.owner.toString());
      succeeded += 1;
    } catch (err) {
      logger.warn("Disease risk sync: failed for one farm, continuing", { farmId: farm._id.toString(), err });
    }
  }

  logger.info(`Disease risk sync complete: ${succeeded}/${farms.length} farm(s) refreshed`);
}

export function startDiseaseRiskSyncWorker(): Worker {
  return new Worker(QUEUE_NAMES.diseaseRiskSync, async () => syncAllDiseaseRisk(), { connection: queueConnection });
}
