import { CropCycle } from "../models/CropCycle.model";
import { DiseaseDetection } from "../models/DiseaseDetection.model";
import { getOwnedFarmOrThrow } from "./farm.service";
import { getLatestByFarm } from "./soil.service";
import { getWeatherForFarm } from "./weather.service";
import { getLatestRisk } from "./diseaseRisk.service";
import { logger } from "../utils/logger";

/**
 * Builds a plain-text summary of a farm's current real data for the LLM
 * prompt. Every line here comes from data this app already computed
 * (Phases 4/5/7/9/8) -- the assistant is grounded in this, not left to
 * guess at the farmer's situation.
 */
export async function buildFarmContext(farmId: string, ownerId: string): Promise<string> {
  const farm = await getOwnedFarmOrThrow(farmId, ownerId);
  const lines: string[] = [`Farm: ${farm.name} (${farm.landAreaAcres} acres, ${farm.irrigationType} irrigation)`];

  const cycle = await CropCycle.findOne({ farm: farmId, status: "active" }).populate("crop");
  if (cycle) {
    const crop = cycle.crop as unknown as { name?: string } | undefined;
    lines.push(`Current crop: ${crop?.name ?? "unknown"}, stage: ${cycle.currentStage}`);
  } else {
    lines.push("No active crop cycle on this farm right now.");
  }

  const soil = await getLatestByFarm(farmId, ownerId);
  if (soil) {
    lines.push(
      `Latest soil report: health score ${soil.healthScore ?? "unknown"}/100. ${soil.interpretation ?? ""}`.trim()
    );
  }

  try {
    const weather = await getWeatherForFarm(farmId, ownerId);
    const c = weather.snapshot.current;
    lines.push(
      `Current weather: ${c.temperature}°C, ${c.humidity}% humidity, ${c.condition}, rain probability ${c.rainProbability}%.`
    );
  } catch (err) {
    logger.warn("Chat context: weather unavailable", { farmId, err });
  }

  if (cycle) {
    const risk = await getLatestRisk(farmId, ownerId);
    if (risk) {
      lines.push(`Latest disease risk assessment: ${risk.riskLevel}. ${risk.reason}`);
    }

    const recentDetections = await DiseaseDetection.find({
      farm: farmId,
      isConfident: true,
      predictedDisease: { $ne: null },
      createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    if (recentDetections.length > 0) {
      lines.push(
        "Recent disease detections: " +
          recentDetections.map((d) => `${d.predictedDisease} (${Math.round((d.confidence ?? 0) * 100)}% confidence)`).join(", ")
      );
    }
  }

  return lines.join("\n");
}
