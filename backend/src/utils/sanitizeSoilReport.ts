import { ISoilReport } from "../models/SoilReport.model";

export function sanitizeSoilReport(report: ISoilReport) {
  return {
    id: report._id.toString(),
    farm: report.farm.toString(),
    source: report.source,
    reportImageUrl: report.reportImageUrl,
    nitrogen: report.nitrogen,
    phosphorus: report.phosphorus,
    potassium: report.potassium,
    ph: report.ph,
    organicCarbon: report.organicCarbon,
    moisture: report.moisture,
    healthScore: report.healthScore,
    interpretation: report.interpretation,
    fertilizerRecommendation: report.fertilizerRecommendation,
    recordedAt: report.recordedAt,
    createdAt: report.createdAt,
  };
}
