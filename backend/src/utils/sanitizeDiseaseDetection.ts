import { IDiseaseDetection } from "../models/DiseaseDetection.model";

export function sanitizeDiseaseDetection(detection: IDiseaseDetection) {
  return {
    id: detection._id.toString(),
    cropCycle: detection.cropCycle?.toString(),
    farm: detection.farm.toString(),
    imageUrl: detection.imageUrl,
    cropType: detection.cropType,
    predictedDisease: detection.predictedDisease,
    confidence: detection.confidence,
    severity: detection.severity,
    symptoms: detection.symptoms,
    possibleCauses: detection.possibleCauses,
    prevention: detection.prevention,
    treatment: detection.treatment,
    recommendedAction: detection.recommendedAction,
    isConfident: detection.isConfident,
    modelVersion: detection.modelVersion,
    status: detection.status,
    createdAt: detection.createdAt,
  };
}
