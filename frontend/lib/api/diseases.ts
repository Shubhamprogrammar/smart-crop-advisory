import { apiClient, unwrap } from "@/lib/apiClient";

export interface DiseaseDetection {
  id: string;
  farm: string;
  farmer: string;
  imageUrl: string;
  cropType: string;
  predictedDisease?: string;
  confidence?: number;
  severity?: "low" | "medium" | "high";
  symptoms: string[];
  possibleCauses: string[];
  prevention: string[];
  treatment: string[];
  recommendedAction: string;
  isConfident: boolean;
  modelVersion: string;
  status: "pending" | "reviewed_by_expert";
  createdAt: string;
}

export interface DiseaseRisk {
  id: string;
  cropCycle: string;
  farm: string;
  riskLevel: "low" | "medium" | "high";
  reason: string;
  preventiveAction: string;
  computedAt: string;
}

export async function getLatestRisk(farmId: string): Promise<{ risk: DiseaseRisk | null }> {
  return unwrap(apiClient.get(`/api/diseases/risk/${farmId}/latest`));
}
