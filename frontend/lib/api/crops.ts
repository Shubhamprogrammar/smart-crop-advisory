import { apiClient, unwrap } from "@/lib/apiClient";

export interface Crop {
  id: string;
  name: string;
  category?: string;
  seasons: string[];
  growthDurationDays?: number;
  diseaseDetectionSupported: boolean;
  imageUrl?: string;
}

export interface CropCycle {
  id: string;
  farm: string;
  crop: Crop | string;
  season?: string;
  areaAcres?: number;
  sowingDate: string;
  expectedHarvestDate?: string;
  currentStage: "sowing" | "germination" | "vegetative" | "flowering" | "fruiting" | "harvest";
  status: "active" | "completed" | "abandoned";
  createdAt: string;
}

export async function listCrops(): Promise<{ crops: Crop[] }> {
  return unwrap(apiClient.get("/api/crops"));
}

export async function getActiveCycle(farmId: string): Promise<{ cycle: CropCycle | null }> {
  return unwrap(apiClient.get(`/api/crops/cycle/${farmId}`));
}

export async function startCropCycle(
  farmId: string,
  input: { cropName: string; areaAcres?: number; season?: string }
): Promise<{ cycle: CropCycle }> {
  return unwrap(apiClient.post(`/api/crops/cycle/${farmId}`, input));
}

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  type: string;
  dueDate?: string;
  status: "pending" | "done" | "skipped";
}

export interface CalendarStage {
  name: string;
  startDate?: string;
  endDate?: string;
  status: "upcoming" | "active" | "completed";
  tasks: CalendarTask[];
}

export interface CropCalendar {
  id: string;
  cropCycle: string;
  stages: CalendarStage[];
}

export async function getCalendar(cycleId: string): Promise<{ calendar: CropCalendar }> {
  return unwrap(apiClient.get(`/api/calendar/${cycleId}`));
}

export async function updateTaskStatus(
  cycleId: string,
  stage: string,
  taskId: string,
  status: "pending" | "done" | "skipped"
): Promise<{ calendar: CropCalendar }> {
  return unwrap(apiClient.patch(`/api/calendar/${cycleId}/task`, { stage, taskId, status }));
}
