import { CropRecommendation, ICropRecommendation } from "../models/CropRecommendation.model";
import { Crop } from "../models/Crop.model";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { getOwnedFarmOrThrow } from "./farm.service";
import { getLatestByFarm } from "./soil.service";
import { getWeatherForFarm } from "./weather.service";
import { requestCropRecommendation } from "./aiClient.service";
import { CropRecommendationInput } from "../validators/recommendation.validator";

interface ResolvedInputs {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  temperature: number;
  humidity: number;
  rainfall: number;
}

async function resolveInputs(
  farmId: string,
  ownerId: string,
  input: CropRecommendationInput
): Promise<ResolvedInputs> {
  const needsSoil =
    input.nitrogen === undefined ||
    input.phosphorus === undefined ||
    input.potassium === undefined ||
    input.ph === undefined;

  const needsWeather = input.temperature === undefined || input.humidity === undefined;

  const [soilReport, weather] = await Promise.all([
    needsSoil ? getLatestByFarm(farmId, ownerId) : Promise.resolve(null),
    needsWeather ? getWeatherForFarm(farmId, ownerId) : Promise.resolve(null),
  ]);

  const nitrogen = input.nitrogen ?? soilReport?.nitrogen;
  const phosphorus = input.phosphorus ?? soilReport?.phosphorus;
  const potassium = input.potassium ?? soilReport?.potassium;
  const ph = input.ph ?? soilReport?.ph;
  const temperature = input.temperature ?? weather?.snapshot.current.temperature;
  const humidity = input.humidity ?? weather?.snapshot.current.humidity;

  const missing: string[] = [];
  if (nitrogen === undefined) missing.push("nitrogen");
  if (phosphorus === undefined) missing.push("phosphorus");
  if (potassium === undefined) missing.push("potassium");
  if (ph === undefined) missing.push("ph");
  if (temperature === undefined) missing.push("temperature");
  if (humidity === undefined) missing.push("humidity");

  if (missing.length > 0) {
    throw ApiError.badRequest(
      `Missing data for: ${missing.join(", ")}. Add a soil report for this farm (for N/P/K/pH) or provide these values manually.`,
      { missing }
    );
  }

  return {
    nitrogen: nitrogen!,
    phosphorus: phosphorus!,
    potassium: potassium!,
    ph: ph!,
    temperature: temperature!,
    humidity: humidity!,
    rainfall: input.rainfall,
  };
}

export async function generateCropRecommendation(
  farmId: string,
  ownerId: string,
  input: CropRecommendationInput
): Promise<{ recommendation: ICropRecommendation; stale: boolean }> {
  await getOwnedFarmOrThrow(farmId, ownerId);

  const resolved = await resolveInputs(farmId, ownerId, input);

  const aiResult = await requestCropRecommendation(resolved);

  if (!aiResult.ok) {
    logger.warn("Crop recommendation AI call failed, attempting stale fallback", {
      farmId,
      reason: aiResult.reason,
    });

    const lastKnown = await CropRecommendation.findOne({ farm: farmId }).sort({ createdAt: -1 });
    if (lastKnown) {
      return { recommendation: lastKnown, stale: true };
    }

    throw ApiError.internal("Crop recommendation is temporarily unavailable.");
  }

  // Resolve crop name -> catalog Crop _id where available (recommendations
  // can include crops not yet seeded in the `crops` catalog collection).
  const cropDocs = await Crop.find({
    name: { $in: aiResult.data.recommendations.map((r) => r.crop) },
  });
  const cropIdByName = new Map(cropDocs.map((c) => [c.name, c._id]));

  const recommendation = await CropRecommendation.create({
    farm: farmId,
    requestedBy: ownerId,
    inputSnapshot: {
      n: resolved.nitrogen,
      p: resolved.phosphorus,
      k: resolved.potassium,
      ph: resolved.ph,
      temperature: resolved.temperature,
      humidity: resolved.humidity,
      rainfall: resolved.rainfall,
      season: input.season,
      waterAvailability: input.waterAvailability,
    },
    recommendations: aiResult.data.recommendations.map((r) => ({
      crop: cropIdByName.get(r.crop),
      cropName: r.crop,
      suitabilityScore: r.suitabilityScore,
      explanation: r.explanation,
      benefits: r.benefits,
      risks: r.risks,
    })),
    modelVersion: aiResult.data.modelVersion,
    source: "ml_model",
  });

  return { recommendation, stale: false };
}

export async function listByFarm(farmId: string, ownerId: string): Promise<ICropRecommendation[]> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  return CropRecommendation.find({ farm: farmId }).sort({ createdAt: -1 });
}

export async function getById(id: string, ownerId: string): Promise<ICropRecommendation> {
  const recommendation = await CropRecommendation.findById(id);
  if (!recommendation) {
    throw ApiError.notFound("Recommendation not found");
  }
  await getOwnedFarmOrThrow(recommendation.farm.toString(), ownerId);
  return recommendation;
}
