import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  timeout: 15000,
});

export type AiResult<T> = { ok: true; data: T } | { ok: false; status?: number; reason: string };

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
  confidence: "none" | "low" | "medium";
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
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
      logger.warn("AI service soil-ocr call failed", { status, detail: detail ?? err.message });
      return { ok: false, status, reason: detail ?? "AI service unavailable" };
    }

    logger.error("Unexpected error calling AI service", { err });
    return { ok: false, reason: "AI service unavailable" };
  }
}
