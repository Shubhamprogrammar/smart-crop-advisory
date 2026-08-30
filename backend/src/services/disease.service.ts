import { DiseaseDetection, IDiseaseDetection } from "../models/DiseaseDetection.model";
import { CropCycle } from "../models/CropCycle.model";
import { ExpertCase } from "../models/ExpertCase.model";
import { Role } from "../constants/enums";
import { ApiError } from "../utils/ApiError";
import { getOwnedFarmOrThrow } from "./farm.service";
import { uploadImageBuffer, fetchPrivateImage } from "./cloudinary.service";
import { requestDiseaseDetection } from "./aiClient.service";
import { SUPPORTED_DISEASE_CROPS, SupportedDiseaseCrop } from "../constants/enums";
import { DetectDiseaseInput } from "../validators/disease.validator";

async function resolveCropType(
  farmId: string,
  override: SupportedDiseaseCrop | undefined
): Promise<{ cropType: SupportedDiseaseCrop; cropCycleId?: string }> {
  if (override) {
    const activeCycle = await CropCycle.findOne({ farm: farmId, status: "active" });
    return { cropType: override, cropCycleId: activeCycle?._id.toString() };
  }

  const activeCycle = await CropCycle.findOne({ farm: farmId, status: "active" }).populate("crop");
  if (!activeCycle) {
    throw ApiError.badRequest(
      `cropType is required — this farm has no active crop cycle. Supported crops: ${SUPPORTED_DISEASE_CROPS.join(", ")}.`
    );
  }

  const crop = activeCycle.crop as unknown as { name: string };
  if (!SUPPORTED_DISEASE_CROPS.includes(crop.name as SupportedDiseaseCrop)) {
    throw ApiError.badRequest(
      `Disease detection is not yet available for ${crop.name}. Currently supported: ${SUPPORTED_DISEASE_CROPS.join(", ")}.`
    );
  }

  return { cropType: crop.name as SupportedDiseaseCrop, cropCycleId: activeCycle._id.toString() };
}

export async function detectDisease(
  farmId: string,
  ownerId: string,
  input: DetectDiseaseInput,
  file: Express.Multer.File
): Promise<IDiseaseDetection> {
  await getOwnedFarmOrThrow(farmId, ownerId);

  const { cropType, cropCycleId } = await resolveCropType(farmId, input.cropType);

  const { publicId, format } = await uploadImageBuffer(file.buffer, "disease-detections");

  const aiResult = await requestDiseaseDetection(file.buffer, file.originalname, file.mimetype);

  if (!aiResult.ok) {
    throw ApiError.internal("Disease detection is temporarily unavailable.");
  }

  const result = aiResult.data;

  return DiseaseDetection.create({
    cropCycle: cropCycleId,
    farm: farmId,
    farmer: ownerId,
    imagePublicId: publicId,
    imageFormat: format,
    cropType: result.cropType ?? cropType,
    predictedDisease: result.diseaseName ?? undefined,
    confidence: result.confidence,
    symptoms: result.symptoms,
    possibleCauses: result.possibleCauses,
    prevention: result.prevention,
    treatment: result.treatment,
    recommendedAction: result.recommendedAction,
    isConfident: result.status !== "low_confidence",
    modelVersion: result.modelVersion,
    status: "pending",
  });
}

export async function listByFarm(farmId: string, ownerId: string): Promise<IDiseaseDetection[]> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  return DiseaseDetection.find({ farm: farmId }).sort({ createdAt: -1 });
}

export async function getById(id: string, ownerId: string): Promise<IDiseaseDetection> {
  const detection = await DiseaseDetection.findById(id);
  if (!detection) {
    throw ApiError.notFound("Disease detection not found");
  }
  await getOwnedFarmOrThrow(detection.farm.toString(), ownerId);
  return detection;
}

/**
 * An expert never owns the farm a detection belongs to — their access is
 * entirely mediated through an ExpertCase that references this detection
 * (mirrors expert.service.ts's assertCaseAccess: assigned to them, or
 * still open for anyone to pick up).
 */
async function expertHasCaseAccess(detectionId: string, expertId: string): Promise<boolean> {
  const found = await ExpertCase.exists({
    diseaseDetection: detectionId,
    $or: [{ expert: expertId }, { status: "open" }],
  });
  return Boolean(found);
}

export async function getImageForUser(
  detectionId: string,
  userId: string,
  role: Role
): Promise<{ buffer: Buffer; contentType: string }> {
  const detection = await DiseaseDetection.findById(detectionId);
  if (!detection) {
    throw ApiError.notFound("Disease detection not found");
  }

  const isOwner = detection.farmer.toString() === userId;
  const allowed =
    role === "admin" ||
    (role === "farmer" && isOwner) ||
    (role === "expert" && (await expertHasCaseAccess(detectionId, userId)));

  if (!allowed) {
    throw ApiError.notFound("Disease detection not found");
  }

  return fetchPrivateImage(detection.imagePublicId, detection.imageFormat);
}
