import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeCropRecommendation } from "../utils/sanitizeCropRecommendation";
import * as recommendationService from "../services/recommendation.service";
import { CropRecommendationInput } from "../validators/recommendation.validator";

export async function generateCropRecommendation(req: Request, res: Response) {
  const input = req.body as CropRecommendationInput;
  const { recommendation, stale } = await recommendationService.generateCropRecommendation(
    req.params.farmId,
    req.user!.id,
    input
  );

  return sendSuccess(res, {
    message: stale
      ? "Live crop recommendation unavailable — showing the last generated recommendation."
      : "Crop recommendation generated",
    data: { recommendation: sanitizeCropRecommendation(recommendation), stale },
    statusCode: stale ? 200 : 201,
  });
}

export async function listRecommendations(req: Request, res: Response) {
  const recommendations = await recommendationService.listByFarm(req.params.farmId, req.user!.id);
  return sendSuccess(res, {
    message: "Recommendations fetched",
    data: { recommendations: recommendations.map(sanitizeCropRecommendation) },
  });
}

export async function getRecommendation(req: Request, res: Response) {
  const recommendation = await recommendationService.getById(req.params.id, req.user!.id);
  return sendSuccess(res, {
    message: "Recommendation fetched",
    data: { recommendation: sanitizeCropRecommendation(recommendation) },
  });
}
