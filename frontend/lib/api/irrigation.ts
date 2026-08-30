import { apiClient, unwrap } from "@/lib/apiClient";

export interface IrrigationRecommendation {
  irrigationRequired: boolean;
  urgency: "none" | "low" | "medium" | "high";
  recommendedAmount: "light" | "moderate" | "deep" | null;
  recommendedFrequencyDays: number | null;
  reason: string;
  moistureDataAvailable: boolean;
  cropStage: string;
}

export async function getIrrigationRecommendation(farmId: string): Promise<IrrigationRecommendation> {
  return unwrap(apiClient.get(`/api/irrigation/${farmId}`));
}
