import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeDiseaseDetection } from "../utils/sanitizeDiseaseDetection";
import { ApiError } from "../utils/ApiError";
import * as diseaseService from "../services/disease.service";
import { DetectDiseaseInput } from "../validators/disease.validator";

export async function detectDisease(req: Request, res: Response) {
  if (!req.file) {
    throw ApiError.badRequest("An image file is required");
  }

  const input = req.body as DetectDiseaseInput;
  const detection = await diseaseService.detectDisease(req.params.farmId, req.user!.id, input, req.file);

  return sendSuccess(res, {
    message: "Disease detection complete",
    data: { detection: sanitizeDiseaseDetection(detection) },
    statusCode: 201,
  });
}

export async function listDetections(req: Request, res: Response) {
  const detections = await diseaseService.listByFarm(req.params.farmId, req.user!.id);
  return sendSuccess(res, {
    message: "Disease detections fetched",
    data: { detections: detections.map(sanitizeDiseaseDetection) },
  });
}

export async function getDetection(req: Request, res: Response) {
  const detection = await diseaseService.getById(req.params.id, req.user!.id);
  return sendSuccess(res, {
    message: "Disease detection fetched",
    data: { detection: sanitizeDiseaseDetection(detection) },
  });
}
