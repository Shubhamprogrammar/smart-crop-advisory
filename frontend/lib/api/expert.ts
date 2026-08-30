import { apiClient, unwrap } from "@/lib/apiClient";
import { User } from "@/lib/api/auth";
import { Farm } from "@/lib/api/farms";
import { CropCycle } from "@/lib/api/crops";
import { SoilReport } from "@/lib/api/soil";
import { DiseaseDetection } from "@/lib/api/diseases";
import { WeatherResult } from "@/lib/api/weather";

export interface ExpertCase {
  id: string;
  farmer: string;
  expert?: string;
  farm: string;
  cropCycle?: string;
  diseaseDetection?: string;
  subject: string;
  description: string;
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export interface ExpertResponseMessage {
  id: string;
  case: string;
  expert: string;
  message: string;
  recommendation?: string;
  attachments: string[];
  createdAt: string;
}

export interface CaseDetail {
  case: ExpertCase;
  farmer: User;
  farm: Farm;
  cropCycle: CropCycle | null;
  soilReport: SoilReport | null;
  weather: WeatherResult | null;
  diseaseDetection: DiseaseDetection | null;
  responses: ExpertResponseMessage[];
}

export interface CreateCaseInput {
  farmId: string;
  cropCycleId?: string;
  diseaseDetectionId?: string;
  subject: string;
  description: string;
  priority?: "low" | "medium" | "high";
}

export async function createCase(input: CreateCaseInput): Promise<{ case: ExpertCase }> {
  return unwrap(apiClient.post("/api/expert/cases", input));
}

export async function listCases(params: {
  page?: number;
  limit?: number;
  status?: ExpertCase["status"];
  assignedToMe?: boolean;
}): Promise<{ cases: ExpertCase[]; total: number; page: number; limit: number }> {
  return unwrap(apiClient.get("/api/expert/cases", { params }));
}

export async function getCaseDetail(id: string): Promise<CaseDetail> {
  return unwrap(apiClient.get(`/api/expert/cases/${id}`));
}

export async function assignCase(id: string): Promise<{ case: ExpertCase }> {
  return unwrap(apiClient.patch(`/api/expert/cases/${id}/assign`));
}

export async function addResponse(
  id: string,
  input: { message: string; recommendation?: string }
): Promise<{ response: ExpertResponseMessage }> {
  return unwrap(apiClient.post(`/api/expert/cases/${id}/responses`, input));
}

export async function updateCaseStatus(
  id: string,
  status: "resolved" | "closed"
): Promise<{ case: ExpertCase }> {
  return unwrap(apiClient.patch(`/api/expert/cases/${id}/status`, { status }));
}
