import { Worker } from "bullmq";
import { queueConnection } from "../config/queueConnection";
import { logger } from "../utils/logger";
import { QUEUE_NAMES } from "../queues/queueNames";
import { Crop } from "../models/Crop.model";
import { getCurrentPrice } from "../services/market.service";

/**
 * Pre-warms the (1-hour, per-crop-per-day) market price cache for the
 * whole crop catalog once a day (spec §8: "Market synchronization"), so
 * the first farmer to check a crop's price each day doesn't pay for the
 * computation themselves. Low-stakes today since prices are simulated
 * (Phase 14) and cheap to compute, but this is exactly the pattern that
 * matters once a real, rate-limited market API is connected.
 */
async function syncAllMarketPrices(): Promise<void> {
  const crops = await Crop.find({}, { name: 1 });

  let succeeded = 0;
  for (const crop of crops) {
    try {
      await getCurrentPrice(crop.name);
      succeeded += 1;
    } catch (err) {
      logger.warn("Market sync: failed for one crop, continuing", { crop: crop.name, err });
    }
  }

  logger.info(`Market sync complete: ${succeeded}/${crops.length} crop(s) refreshed`);
}

export function startMarketSyncWorker(): Worker {
  return new Worker(QUEUE_NAMES.marketSync, async () => syncAllMarketPrices(), { connection: queueConnection });
}
