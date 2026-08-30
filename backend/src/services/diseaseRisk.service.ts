import { DiseaseRisk, IDiseaseRisk } from "../models/DiseaseRisk.model";
import { DiseaseDetection } from "../models/DiseaseDetection.model";
import { CropCycle } from "../models/CropCycle.model";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { getOwnedFarmOrThrow } from "./farm.service";
import { getWeatherForFarm } from "./weather.service";
import { requestDiseaseRisk } from "./aiClient.service";

const RECENT_DETECTION_WINDOW_DAYS = 14;

async function getActiveCycleOrThrow(farmId: string) {
  const cycle = await CropCycle.findOne({ farm: farmId, status: "active" });
  if (!cycle) {
    throw ApiError.badRequest("This farm has no active crop cycle to assess disease risk for.");
  }
  return cycle;
}

async function hasRecentDiseaseDetection(cropCycleId: string): Promise<boolean> {
  const since = new Date(Date.now() - RECENT_DETECTION_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const found = await DiseaseDetection.exists({
    cropCycle: cropCycleId,
    isConfident: true,
    predictedDisease: { $ne: null },
    createdAt: { $gte: since },
  });
  return Boolean(found);
}

export async function computeDiseaseRisk(
  farmId: string,
  ownerId: string
): Promise<{ risk: IDiseaseRisk; stale: boolean }> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  const cycle = await getActiveCycleOrThrow(farmId);

  const [weather, recentDiseaseDetected] = await Promise.all([
    getWeatherForFarm(farmId, ownerId),
    hasRecentDiseaseDetection(cycle._id.toString()),
  ]);

  const aiResult = await requestDiseaseRisk({
    cropStage: cycle.currentStage,
    temperature: weather.snapshot.current.temperature,
    humidity: weather.snapshot.current.humidity,
    rainfall: weather.snapshot.current.rainfall,
    rainProbability: weather.snapshot.current.rainProbability,
    recentDiseaseDetected,
  });

  if (!aiResult.ok) {
    logger.warn("Disease risk AI call failed, attempting stale fallback", { farmId, reason: aiResult.reason });

    const lastKnown = await DiseaseRisk.findOne({ cropCycle: cycle._id }).sort({ computedAt: -1 });
    if (lastKnown) {
      return { risk: lastKnown, stale: true };
    }

    throw ApiError.internal("Disease risk assessment is temporarily unavailable.");
  }

  const risk = await DiseaseRisk.create({
    cropCycle: cycle._id,
    farm: farmId,
    riskLevel: aiResult.data.riskLevel,
    reason: aiResult.data.reason,
    preventiveAction: aiResult.data.preventiveAction,
    weatherSnapshot: {
      temperature: weather.snapshot.current.temperature,
      humidity: weather.snapshot.current.humidity,
      rainfall: weather.snapshot.current.rainfall,
    },
    computedAt: new Date(),
  });

  return { risk, stale: false };
}

export async function getLatestRisk(farmId: string, ownerId: string): Promise<IDiseaseRisk | null> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  const cycle = await CropCycle.findOne({ farm: farmId, status: "active" });
  if (!cycle) return null;
  return DiseaseRisk.findOne({ cropCycle: cycle._id }).sort({ computedAt: -1 });
}

export async function listRiskHistory(farmId: string, ownerId: string): Promise<IDiseaseRisk[]> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  const cycle = await CropCycle.findOne({ farm: farmId, status: "active" });
  if (!cycle) return [];
  return DiseaseRisk.find({ cropCycle: cycle._id }).sort({ computedAt: -1 });
}
