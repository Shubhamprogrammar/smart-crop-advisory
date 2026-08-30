import { apiClient, unwrap } from "@/lib/apiClient";

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
