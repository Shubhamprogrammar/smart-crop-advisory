import { Advisory, IAdvisory } from "../models/Advisory.model";
import { CropCycle } from "../models/CropCycle.model";
import { DiseaseDetection } from "../models/DiseaseDetection.model";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { getOwnedFarmOrThrow } from "./farm.service";
import { getLatestByFarm } from "./soil.service";
import { getWeatherForFarm, WeatherResult } from "./weather.service";
import { getLatestRisk } from "./diseaseRisk.service";
import { AdvisoryContext, runAllRules } from "./advisoryRules";
import { getRuleThresholds } from "./advisoryRuleConfig.service";
import { createNotification } from "./notification.service";

const RECENT_DETECTION_WINDOW_DAYS = 7;
const DEDUPE_WINDOW_HOURS = 24;

async function buildContext(farmId: string, ownerId: string): Promise<AdvisoryContext> {
  const farm = await getOwnedFarmOrThrow(farmId, ownerId);
  const cycle = await CropCycle.findOne({ farm: farmId, status: "active" }).populate("crop");

  let weather: WeatherResult | null = null;
  try {
    weather = await getWeatherForFarm(farmId, ownerId);
  } catch (err) {
    logger.warn("Advisory engine: weather unavailable, continuing without it", { farmId, err });
  }

  const [soilReport, diseaseRisk, recentDiseaseDetections] = await Promise.all([
    getLatestByFarm(farmId, ownerId),
    getLatestRisk(farmId, ownerId),
    DiseaseDetection.find({
      farm: farmId,
      isConfident: true,
      predictedDisease: { $ne: null },
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - RECENT_DETECTION_WINDOW_DAYS * 24 * 60 * 60 * 1000) },
    }),
  ]);

  return { farm, cycle, soilReport, weather, diseaseRisk, recentDiseaseDetections };
}

export async function generateAdvisories(farmId: string, ownerId: string): Promise<IAdvisory[]> {
  const ctx = await buildContext(farmId, ownerId);
  const thresholds = await getRuleThresholds();
  const candidates = runAllRules(ctx, thresholds);

  const dedupeSince = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000);
  const results: IAdvisory[] = [];

  for (const candidate of candidates) {
    const existing = await Advisory.findOne({
      farm: farmId,
      type: candidate.type,
      title: candidate.title,
      status: "active",
      createdAt: { $gte: dedupeSince },
    });

    if (existing) {
      results.push(existing);
      continue;
    }

    const created = await Advisory.create({
      farm: farmId,
      farmer: ownerId,
      cropCycle: ctx.cycle?._id,
      type: candidate.type,
      priority: candidate.priority,
      title: candidate.title,
      reason: candidate.reason,
      action: candidate.action,
      deadline: candidate.deadline,
      status: "active",
      generatedBy: "rule_engine",
      sourceData: candidate.sourceData,
    });
    results.push(created);

    // Notify on genuinely new, actionable advisories only -- "low"
    // priority is intentionally excluded here to avoid notification
    // fatigue (the advisory feed itself still shows everything).
    if (candidate.priority === "high" || candidate.priority === "medium") {
      await createNotification({
        userId: ownerId,
        type: candidate.type,
        title: candidate.title,
        message: candidate.action,
        relatedAdvisory: created._id.toString(),
      });
    }
  }

  return results;
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export async function listActiveAdvisories(farmId: string, ownerId: string): Promise<IAdvisory[]> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  const advisories = await Advisory.find({ farm: farmId, status: "active" }).sort({ createdAt: -1 });
  // Sorted by severity in application code: Mongo would sort the priority
  // string lexicographically ("high" < "low" < "medium"), not by severity.
  return advisories.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

export async function listAllAdvisories(farmId: string, ownerId: string): Promise<IAdvisory[]> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  return Advisory.find({ farm: farmId }).sort({ createdAt: -1 });
}

export async function updateStatus(
  advisoryId: string,
  ownerId: string,
  status: "acknowledged" | "dismissed"
): Promise<IAdvisory> {
  const advisory = await Advisory.findById(advisoryId);
  if (!advisory) {
    throw ApiError.notFound("Advisory not found");
  }
  await getOwnedFarmOrThrow(advisory.farm.toString(), ownerId);

  advisory.status = status;
  await advisory.save();
  return advisory;
}
