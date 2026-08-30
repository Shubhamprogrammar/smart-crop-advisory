import { SoilReport, ISoilReport } from "../models/SoilReport.model";
import { ApiError } from "../utils/ApiError";
import { computeSoilHealth } from "../utils/soilHealth";
import { getOwnedFarmOrThrow } from "./farm.service";
import { uploadImageBuffer } from "./cloudinary.service";
import { requestSoilOcr } from "./aiClient.service";
import { ManualSoilEntryInput } from "../validators/soil.validator";

export async function createManualEntry(
  farmId: string,
  ownerId: string,
  input: ManualSoilEntryInput
): Promise<ISoilReport> {
  await getOwnedFarmOrThrow(farmId, ownerId);

  const { healthScore, interpretation, fertilizerRecommendation } = computeSoilHealth(input);

  return SoilReport.create({
    farm: farmId,
    source: "manual",
    nitrogen: input.nitrogen,
    phosphorus: input.phosphorus,
    potassium: input.potassium,
    ph: input.ph,
    organicCarbon: input.organicCarbon,
    moisture: input.moisture,
    healthScore,
    interpretation,
    fertilizerRecommendation,
  });
}

export async function createFromUpload(
  farmId: string,
  ownerId: string,
  file: Express.Multer.File
): Promise<ISoilReport> {
  await getOwnedFarmOrThrow(farmId, ownerId);

  const { url } = await uploadImageBuffer(file.buffer, "soil-reports");

  const ocrResult = await requestSoilOcr(file.buffer, file.originalname, file.mimetype);

  if (!ocrResult.ok) {
    return SoilReport.create({
      farm: farmId,
      source: "upload_ocr",
      reportImageUrl: url,
      interpretation:
        "Soil report image saved, but automatic text extraction was unavailable. Please enter values manually.",
      fertilizerRecommendation: "Add soil readings to receive a fertilizer recommendation.",
    });
  }

  const extracted = ocrResult.data.extracted;
  const soilInput = {
    nitrogen: extracted.nitrogen ?? undefined,
    phosphorus: extracted.phosphorus ?? undefined,
    potassium: extracted.potassium ?? undefined,
    ph: extracted.ph ?? undefined,
    organicCarbon: extracted.organicCarbon ?? undefined,
    moisture: extracted.moisture ?? undefined,
  };

  const { healthScore, interpretation, fertilizerRecommendation } = computeSoilHealth(soilInput);

  const ocrNote =
    ocrResult.data.confidence === "none"
      ? " No values could be automatically read from this image — please verify or enter them manually."
      : " Values were auto-extracted from the uploaded report and should be double-checked against the original.";

  return SoilReport.create({
    farm: farmId,
    source: "upload_ocr",
    reportImageUrl: url,
    ...soilInput,
    healthScore,
    interpretation: interpretation + ocrNote,
    fertilizerRecommendation,
    ocrRawText: ocrResult.data.rawText,
  });
}

export async function listByFarm(farmId: string, ownerId: string): Promise<ISoilReport[]> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  return SoilReport.find({ farm: farmId }).sort({ recordedAt: -1 });
}

export async function getLatestByFarm(farmId: string, ownerId: string): Promise<ISoilReport | null> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  return SoilReport.findOne({ farm: farmId }).sort({ recordedAt: -1 });
}

export async function getReportById(reportId: string, ownerId: string): Promise<ISoilReport> {
  const report = await SoilReport.findById(reportId);
  if (!report) {
    throw ApiError.notFound("Soil report not found");
  }

  await getOwnedFarmOrThrow(report.farm.toString(), ownerId);
  return report;
}
