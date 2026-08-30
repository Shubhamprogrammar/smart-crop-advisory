import { CropCycle } from "../models/CropCycle.model";
import { ApiError } from "../utils/ApiError";
import { computeIrrigationRecommendation, IrrigationRecommendation } from "../utils/irrigationEngine";
import { getOwnedFarmOrThrow } from "./farm.service";
import { getWeatherForFarm } from "./weather.service";
import { getLatestMoistureReading } from "./soilMoistureProvider.service";

export async function getIrrigationRecommendation(
  farmId: string,
  ownerId: string
): Promise<IrrigationRecommendation & { cropStage: string }> {
  await getOwnedFarmOrThrow(farmId, ownerId);

  const cycle = await CropCycle.findOne({ farm: farmId, status: "active" });
  if (!cycle) {
    throw ApiError.badRequest("This farm has no active crop cycle to recommend irrigation for.");
  }

  const [weather, soilMoisturePercent] = await Promise.all([
    getWeatherForFarm(farmId, ownerId),
    getLatestMoistureReading(farmId, ownerId),
  ]);

  const recommendation = computeIrrigationRecommendation({
    cropStage: cycle.currentStage,
    temperature: weather.snapshot.current.temperature,
    humidity: weather.snapshot.current.humidity,
    rainProbability: weather.snapshot.current.rainProbability,
    soilMoisturePercent,
  });

  return { ...recommendation, cropStage: cycle.currentStage };
}
