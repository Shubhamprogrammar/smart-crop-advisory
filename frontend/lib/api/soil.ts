import { apiClient, unwrap } from "@/lib/apiClient";

export interface SoilReport {
  id: string;
  farm: string;
  source: "manual" | "upload_ocr";
  reportImageUrl?: string;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  ph?: number;
  organicCarbon?: number;
  moisture?: number;
  healthScore?: number;
  interpretation?: string;
  fertilizerRecommendation?: string;
  recordedAt: string;
  createdAt: string;
}

export async function getLatestSoilReport(farmId: string): Promise<{ report: SoilReport | null }> {
  return unwrap(apiClient.get(`/api/soil/${farmId}/latest`));
}
