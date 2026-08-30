/**
 * Soil moisture provider — the IoT integration point.
 *
 * Per spec §O ("design the system so that IoT soil-moisture sensors could
 * be integrated later"): irrigation logic (irrigationEngine.ts) never
 * reads SoilReport directly. It only receives a moisture percentage
 * through this function, isolated exactly like weatherProvider.service.ts
 * (Phase 5) and marketDataProvider.service.ts (Phase 14) are isolated
 * from their consumers.
 *
 * Today this reads the farmer's latest manually-entered SoilReport
 * (Phase 4). Swapping in real IoT sensors later means replacing this
 * function's body with a query against live device telemetry (e.g. the
 * most recent reading from a farm's registered sensor, falling back to
 * the last manual SoilReport if the sensor is offline) — no change
 * needed to irrigationEngine.ts or irrigation.service.ts.
 */
import { getLatestByFarm } from "./soil.service";

export async function getLatestMoistureReading(
  farmId: string,
  ownerId: string
): Promise<number | undefined> {
  const report = await getLatestByFarm(farmId, ownerId);
  return report?.moisture;
}
