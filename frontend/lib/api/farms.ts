import { apiClient, unwrap } from "@/lib/apiClient";

export interface Farm {
  id: string;
  name: string;
  landAreaAcres: number;
  location?: { latitude: number; longitude: number };
  address?: string;
  soilType?: string;
  irrigationType: string;
  activeCropCycle?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmInput {
  name: string;
  landAreaAcres: number;
  location: { latitude: number; longitude: number };
  address?: string;
  soilType?: string;
  irrigationType?: string;
}

export async function listFarms(): Promise<{ farms: Farm[] }> {
  return unwrap(apiClient.get("/api/farms"));
}

export async function getFarm(id: string): Promise<{ farm: Farm }> {
  return unwrap(apiClient.get(`/api/farms/${id}`));
}

export async function createFarm(input: CreateFarmInput): Promise<{ farm: Farm }> {
  return unwrap(apiClient.post("/api/farms", input));
}
