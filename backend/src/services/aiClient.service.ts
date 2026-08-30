import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  timeout: 15000,
});

export type AiResult<T> = { ok: true; data: T } | { ok: false; status?: number; reason: string };

function handleAiError(err: unknown, context: string): { ok: false; status?: number; reason: string } {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
    logger.warn(`AI service ${context} call failed`, { status, detail: detail ?? err.message });
    return { ok: false, status, reason: detail ?? "AI service unavailable" };
  }

  logger.error(`Unexpected error calling AI service (${context})`, { err });
  return { ok: false, reason: "AI service unavailable" };
}

export interface SoilOcrExtracted {
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  ph: number | null;
  organicCarbon: number | null;
  moisture: number | null;
}

export interface SoilOcrResponse {
  rawText: string;
  extracted: SoilOcrExtracted;
  confidence: "none" | "low" | "medium" | "high";
  modelVersion: string;
}

export async function requestSoilOcr(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<AiResult<SoilOcrResponse>> {
  try {
    const form = new FormData();
    form.append("image", buffer, { filename, contentType: mimetype });

    const { data } = await aiClient.post<SoilOcrResponse>("/ai/soil-ocr", form, {
      headers: form.getHeaders(),
    });

    return { ok: true, data };
  } catch (err) {
    return handleAiError(err, "soil-ocr");
  }
}

export interface CropRecommendationRequest {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropPrediction {
  crop: string;
  suitabilityScore: number;
  explanation: string;
  benefits: string[];
  risks: string[];
}

export interface CropRecommendationResponse {
  recommendations: CropPrediction[];
  modelVersion: string;
  source: "ml_model";
}

export async function requestCropRecommendation(
  input: CropRecommendationRequest
): Promise<AiResult<CropRecommendationResponse>> {
  try {
    const { data } = await aiClient.post<CropRecommendationResponse>(
      "/ai/crop-recommendation",
      input
    );
    return { ok: true, data };
  } catch (err) {
    return handleAiError(err, "crop-recommendation");
  }
}
