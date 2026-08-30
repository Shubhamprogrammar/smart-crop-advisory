import { apiClient, unwrap } from "@/lib/apiClient";

export interface Advisory {
  id: string;
  farm: string;
  cropCycle?: string;
  type: string;
  priority: "low" | "medium" | "high";
  title: string;
  reason: string;
  action: string;
  deadline?: string;
  status: "active" | "acknowledged" | "dismissed" | "expired";
  createdAt: string;
}

export async function listActiveAdvisories(farmId: string): Promise<{ advisories: Advisory[] }> {
  return unwrap(apiClient.get(`/api/advisories/${farmId}`));
}

export async function generateAdvisories(farmId: string): Promise<{ advisories: Advisory[] }> {
  return unwrap(apiClient.post(`/api/advisories/${farmId}/generate`));
}

export async function updateAdvisoryStatus(
  id: string,
  status: "acknowledged" | "dismissed"
): Promise<{ advisory: Advisory }> {
  return unwrap(apiClient.patch(`/api/advisories/${id}/status`, { status }));
}
