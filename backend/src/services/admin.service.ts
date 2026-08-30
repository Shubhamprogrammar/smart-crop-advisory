import { Types } from "mongoose";
import { escapeRegex } from "../utils/escapeRegex";
import { User, IUser } from "../models/User.model";
import { Farm } from "../models/Farm.model";
import { CropCycle } from "../models/CropCycle.model";
import { Crop, ICrop } from "../models/Crop.model";
import { DiseaseDetection, IDiseaseDetection } from "../models/DiseaseDetection.model";
import { DiseaseRisk } from "../models/DiseaseRisk.model";
import { Advisory, IAdvisory } from "../models/Advisory.model";
import { Role, RiskLevel } from "../constants/enums";
import { ApiError } from "../utils/ApiError";
import { getCurrentPrice, getTrend } from "./market.service";
import { getRuleThresholds, updateRuleThresholds } from "./advisoryRuleConfig.service";
import { RuleThresholds } from "./advisoryRules";
import { logger } from "../utils/logger";

const ACTIVITY_WINDOW_DAYS = 7;
const REGION_BUCKET_DECIMALS = 1; // ~11km grid cells

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// --- Dashboard stats -------------------------------------------------------

interface LatestFarmRisk {
  _id: Types.ObjectId; // farm id
  riskLevel: RiskLevel;
}

async function getLatestRiskPerFarm(): Promise<LatestFarmRisk[]> {
  return DiseaseRisk.aggregate([
    { $sort: { farm: 1, computedAt: -1 } },
    { $group: { _id: "$farm", riskLevel: { $first: "$riskLevel" } } },
  ]);
}

async function getCropDistribution(limit = 10) {
  return CropCycle.aggregate([
    { $match: { status: "active" } },
    { $lookup: { from: "crops", localField: "crop", foreignField: "_id", as: "cropDoc" } },
    { $unwind: "$cropDoc" },
    { $group: { _id: "$cropDoc.name", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, crop: "$_id", count: 1 } },
  ]);
}

async function getDiseaseDistribution(limit = 10) {
  return DiseaseDetection.aggregate([
    { $match: { predictedDisease: { $ne: null } } },
    { $group: { _id: "$predictedDisease", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, disease: "$_id", count: 1 } },
  ]);
}

async function getRegionalRisk(limit = 20) {
  const latestRisks = await getLatestRiskPerFarm();
  if (latestRisks.length === 0) return [];

  const farmIds = latestRisks.map((r) => r._id);
  const farms = await Farm.find({ _id: { $in: farmIds } }, { location: 1 });
  const locationByFarm = new Map(farms.map((f) => [f._id.toString(), f.location]));

  const buckets = new Map<string, { lat: number; lng: number; low: number; medium: number; high: number }>();
  for (const risk of latestRisks) {
    const location = locationByFarm.get(risk._id.toString());
    if (!location) continue;
    const [lng, lat] = location.coordinates;
    const roundedLat = Number(lat.toFixed(REGION_BUCKET_DECIMALS));
    const roundedLng = Number(lng.toFixed(REGION_BUCKET_DECIMALS));
    const key = `${roundedLat},${roundedLng}`;

    if (!buckets.has(key)) {
      buckets.set(key, { lat: roundedLat, lng: roundedLng, low: 0, medium: 0, high: 0 });
    }
    buckets.get(key)![risk.riskLevel] += 1;
  }

  return Array.from(buckets.values())
    .sort((a, b) => b.high - a.high || b.medium - a.medium)
    .slice(0, limit);
}

async function getMarketTrendsSummary(cropDistribution: { crop: string; count: number }[]) {
  const topCrops = cropDistribution.slice(0, 5).map((c) => c.crop);
  if (topCrops.length === 0) return [];

  const results = await Promise.all(
    topCrops.map(async (crop) => {
      try {
        const [price, trend] = await Promise.all([getCurrentPrice(crop), getTrend(crop)]);
        return {
          crop,
          modalPrice: price.modalPrice,
          direction: trend.prediction.direction,
          isSimulated: price.isSimulated,
        };
      } catch (err) {
        logger.warn("Admin stats: market trend unavailable for crop", { crop, err });
        return null;
      }
    })
  );

  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}

export async function getDashboardStats() {
  const [
    totalFarmers,
    totalFarms,
    activeCrops,
    diseaseDetections,
    activeAdvisories,
    newUsersRecent,
    activeUsersRecent,
    cropDistribution,
    diseaseDistribution,
    latestRisks,
  ] = await Promise.all([
    User.countDocuments({ role: "farmer" }),
    Farm.countDocuments({}),
    CropCycle.countDocuments({ status: "active" }),
    DiseaseDetection.countDocuments({}),
    Advisory.countDocuments({ status: "active" }),
    User.countDocuments({ createdAt: { $gte: daysAgo(ACTIVITY_WINDOW_DAYS) } }),
    User.countDocuments({ lastLoginAt: { $gte: daysAgo(ACTIVITY_WINDOW_DAYS) } }),
    getCropDistribution(),
    getDiseaseDistribution(),
    getLatestRiskPerFarm(),
  ]);

  const highRiskFarms = latestRisks.filter((r) => r.riskLevel === "high").length;
  const [regionalRisk, marketTrends] = await Promise.all([
    getRegionalRisk(),
    getMarketTrendsSummary(cropDistribution),
  ]);

  return {
    totalFarmers,
    totalFarms,
    activeCrops,
    diseaseDetections,
    activeAdvisories,
    highRiskFarms,
    userActivity: {
      newUsersLast7Days: newUsersRecent,
      activeUsersLast7Days: activeUsersRecent,
      windowDays: ACTIVITY_WINDOW_DAYS,
    },
    cropDistribution,
    diseaseDistribution,
    regionalRisk,
    marketTrends,
  };
}

// --- Users -------------------------------------------------------------

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  role?: Role;
  search?: string;
  isActive?: boolean;
}

export async function listUsers(query: ListUsersQuery) {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const filter: Record<string, unknown> = {};
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive;
  if (query.search) {
    const re = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [{ name: re }, { email: re }, { phone: re }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, total, page, limit };
}

export interface UpdateUserInput {
  role?: Role;
  isActive?: boolean;
}

export async function updateUser(
  targetUserId: string,
  input: UpdateUserInput,
  actingAdminId: string
): Promise<IUser> {
  if (targetUserId === actingAdminId && (input.role !== undefined || input.isActive === false)) {
    throw ApiError.badRequest("You cannot change your own role or deactivate your own account");
  }

  const user = await User.findByIdAndUpdate(targetUserId, { $set: input }, { new: true });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

// --- Crops ---------------------------------------------------------------

export interface CropInput {
  name: string;
  localNames?: { hi?: string; mr?: string; gu?: string };
  category?: string;
  seasons?: string[];
  idealN?: { min?: number; max?: number };
  idealP?: { min?: number; max?: number };
  idealK?: { min?: number; max?: number };
  idealPh?: { min?: number; max?: number };
  idealTemperature?: { min?: number; max?: number };
  idealRainfall?: { min?: number; max?: number };
  growthDurationDays?: number;
  diseaseDetectionSupported?: boolean;
  imageUrl?: string;
}

export async function createCrop(input: CropInput): Promise<ICrop> {
  const existing = await Crop.findOne({ name: input.name.toLowerCase() });
  if (existing) throw ApiError.conflict(`Crop "${input.name}" already exists`);
  return Crop.create({ ...input, name: input.name.toLowerCase() });
}

export async function updateCrop(id: string, input: Partial<CropInput>): Promise<ICrop> {
  const update = { ...input };
  if (update.name) update.name = update.name.toLowerCase();
  const crop = await Crop.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!crop) throw ApiError.notFound("Crop not found");
  return crop;
}

// --- Advisories (system-wide oversight) -----------------------------------

export interface ListAdvisoriesQuery {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}

export async function listAdvisories(query: ListAdvisoriesQuery) {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  const [advisories, total] = await Promise.all([
    Advisory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("farm", "name")
      .populate("farmer", "name phone"),
    Advisory.countDocuments(filter),
  ]);

  return { advisories, total, page, limit };
}

export function sanitizeAdvisoryAdmin(advisory: IAdvisory) {
  const farm = advisory.farm as unknown as { _id: Types.ObjectId; name: string } | undefined;
  const farmer = advisory.farmer as unknown as { _id: Types.ObjectId; name: string; phone?: string } | undefined;
  const farmPopulated = farm && typeof farm === "object" && "name" in farm;
  const farmerPopulated = farmer && typeof farmer === "object" && "name" in farmer;

  return {
    id: advisory._id.toString(),
    farm: farmPopulated ? { id: farm._id.toString(), name: farm.name } : advisory.farm.toString(),
    farmer: farmerPopulated
      ? { id: farmer._id.toString(), name: farmer.name, phone: farmer.phone }
      : advisory.farmer.toString(),
    type: advisory.type,
    priority: advisory.priority,
    title: advisory.title,
    reason: advisory.reason,
    action: advisory.action,
    status: advisory.status,
    generatedBy: advisory.generatedBy,
    createdAt: advisory.createdAt,
  };
}

// --- Disease detections (system-wide oversight) ---------------------------

export interface ListDiseaseDetectionsQuery {
  page?: number;
  limit?: number;
  severity?: RiskLevel;
}

export async function listDiseaseDetections(query: ListDiseaseDetectionsQuery) {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const filter: Record<string, unknown> = {};
  if (query.severity) filter.severity = query.severity;

  const [detections, total] = await Promise.all([
    DiseaseDetection.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("farmer", "name phone"),
    DiseaseDetection.countDocuments(filter),
  ]);

  return { detections, total, page, limit };
}

export function sanitizeDiseaseDetectionAdmin(detection: IDiseaseDetection) {
  const farmer = detection.farmer as unknown as { _id: Types.ObjectId; name: string; phone?: string } | undefined;
  const farmerPopulated = farmer && typeof farmer === "object" && "name" in farmer;

  return {
    id: detection._id.toString(),
    farm: detection.farm.toString(),
    farmer: farmerPopulated
      ? { id: farmer._id.toString(), name: farmer.name, phone: farmer.phone }
      : detection.farmer.toString(),
    imageUrl: `/api/diseases/detection/${detection._id.toString()}/image`,
    cropType: detection.cropType,
    predictedDisease: detection.predictedDisease,
    confidence: detection.confidence,
    severity: detection.severity,
    isConfident: detection.isConfident,
    status: detection.status,
    createdAt: detection.createdAt,
  };
}

// --- Advisory rule config (re-exported for a single admin import surface) -

export { getRuleThresholds, updateRuleThresholds };
export type { RuleThresholds };
