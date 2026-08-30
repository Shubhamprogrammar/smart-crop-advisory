import { Worker } from "bullmq";
import { queueConnection } from "../config/queueConnection";
import { logger } from "../utils/logger";
import { QUEUE_NAMES } from "../queues/queueNames";
import { Farm } from "../models/Farm.model";
import { getWeatherByLocation } from "../services/weather.service";

/**
 * Proactively refreshes the weather cache for every active farm's
 * location (spec §8: "Use BullMQ for: Weather synchronization") so a
 * farmer's dashboard request almost always hits a warm cache instead of
 * being the one that pays for a cold fetch. getWeatherByLocation already
 * caches internally (Phase 5), so this worker's only job is to call it
 * for every distinct location — deduped to 2-decimal precision, the same
 * granularity the cache key already uses, so farms in the same area
 * don't each trigger a separate upstream call.
 */
async function syncAllFarmWeather(): Promise<void> {
  const farms = await Farm.find({ status: "active" }, { location: 1 });

  const seen = new Set<string>();
  const uniqueLocations: { latitude: number; longitude: number }[] = [];
  for (const farm of farms) {
    const [longitude, latitude] = farm.location.coordinates;
    const key = `${latitude.toFixed(2)}:${longitude.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueLocations.push({ latitude, longitude });
  }

  let succeeded = 0;
  for (const { latitude, longitude } of uniqueLocations) {
    try {
      await getWeatherByLocation(latitude, longitude);
      succeeded += 1;
    } catch (err) {
      logger.warn("Weather sync: failed for one location, continuing", { latitude, longitude, err });
    }
  }

  logger.info(`Weather sync complete: ${succeeded}/${uniqueLocations.length} location(s) refreshed`);
}

export function startWeatherSyncWorker(): Worker {
  return new Worker(QUEUE_NAMES.weatherSync, async () => syncAllFarmWeather(), { connection: queueConnection });
}
