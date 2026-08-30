import { ICropRecommendation } from "../models/CropRecommendation.model";

export function sanitizeCropRecommendation(rec: ICropRecommendation) {
  return {
    id: rec._id.toString(),
    farm: rec.farm.toString(),
    inputSnapshot: rec.inputSnapshot,
    recommendations: rec.recommendations.map((r) => ({
      crop: r.crop?.toString(),
      cropName: r.cropName,
      suitabilityScore: r.suitabilityScore,
      explanation: r.explanation,
      benefits: r.benefits,
      risks: r.risks,
    })),
    modelVersion: rec.modelVersion,
    source: rec.source,
    createdAt: rec.createdAt,
  };
}
