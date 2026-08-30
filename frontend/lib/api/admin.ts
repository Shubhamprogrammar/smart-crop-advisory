import { apiClient, unwrap } from "@/lib/apiClient";
import { User } from "@/lib/api/auth";
import { Crop } from "@/lib/api/crops";

export interface AdminStats {
  totalFarmers: number;
  totalFarms: number;
  activeCrops: number;
  diseaseDetections: number;
  activeAdvisories: number;
  highRiskFarms: number;
  userActivity: { newUsersLast7Days: number; activeUsersLast7Days: number; windowDays: number };
  cropDistribution: { crop: string; count: number }[];
  diseaseDistribution: { disease: string; count: number }[];
  regionalRisk: { lat: number; lng: number; low: number; medium: number; high: number }[];
  marketTrends: { crop: string; modalPrice: number; direction: string; isSimulated: boolean }[];
}

export async function getStats(): Promise<AdminStats> {
  return unwrap(apiClient.get("/api/admin/stats"));
}

// --- Users -----------------------------------------------------------------

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: "farmer" | "expert" | "admin";
  search?: string;
  isActive?: boolean;
}

export async function listUsers(
  params: ListUsersParams
): Promise<{ users: User[]; total: number; page: number; limit: number }> {
  return unwrap(apiClient.get("/api/admin/users", { params }));
}

export async function updateUser(
  id: string,
  input: { role?: User["role"]; isActive?: boolean }
): Promise<{ user: User }> {
  return unwrap(apiClient.patch(`/api/admin/users/${id}`, input));
}

// --- Crops -------------------------------------------------------------

export interface AdminCropInput {
  name: string;
  category?: string;
  seasons?: string[];
  growthDurationDays?: number;
  diseaseDetectionSupported?: boolean;
  imageUrl?: string;
}

export async function listCrops(): Promise<{ crops: Crop[] }> {
  return unwrap(apiClient.get("/api/admin/crops"));
}

export async function createCrop(input: AdminCropInput): Promise<{ crop: Crop }> {
  return unwrap(apiClient.post("/api/admin/crops", input));
}

export async function updateCrop(id: string, input: Partial<AdminCropInput>): Promise<{ crop: Crop }> {
  return unwrap(apiClient.patch(`/api/admin/crops/${id}`, input));
}

// --- Advisories (system-wide) -----------------------------------------

export interface AdminAdvisory {
  id: string;
  farm: { id: string; name: string } | string;
  farmer: { id: string; name: string; phone?: string } | string;
  type: string;
  priority: "low" | "medium" | "high";
  title: string;
  reason: string;
  action: string;
  status: "active" | "acknowledged" | "dismissed" | "expired";
  generatedBy: string;
  createdAt: string;
}

export async function listAdvisories(params: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}): Promise<{ advisories: AdminAdvisory[]; total: number; page: number; limit: number }> {
  return unwrap(apiClient.get("/api/admin/advisories", { params }));
}

// --- Disease detections (system-wide) -----------------------------------

export interface AdminDiseaseDetection {
  id: string;
  farm: string;
  farmer: { id: string; name: string; phone?: string } | string;
  imageUrl: string;
  cropType: string;
  predictedDisease?: string;
  confidence?: number;
  severity?: "low" | "medium" | "high";
  isConfident: boolean;
  status: "pending" | "reviewed_by_expert";
  createdAt: string;
}

export async function listDiseaseDetections(params: {
  page?: number;
  limit?: number;
  severity?: "low" | "medium" | "high";
}): Promise<{ detections: AdminDiseaseDetection[]; total: number; page: number; limit: number }> {
  return unwrap(apiClient.get("/api/admin/diseases", { params }));
}

// --- Advisory rule thresholds ---------------------------------------------

export interface RuleThresholds {
  heavyRainProbability: number;
  heavyRainMm: number;
  strongWindKmh: number;
  heatStressC: number;
  coldStressC: number;
}

export async function getRuleThresholds(): Promise<{ thresholds: RuleThresholds }> {
  return unwrap(apiClient.get("/api/admin/rules"));
}

export async function updateRuleThresholds(
  input: Partial<RuleThresholds>
): Promise<{ thresholds: RuleThresholds }> {
  return unwrap(apiClient.patch("/api/admin/rules", input));
}
