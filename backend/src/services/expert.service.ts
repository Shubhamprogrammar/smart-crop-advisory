import { Types } from "mongoose";
import { ExpertCase, IExpertCase } from "../models/ExpertCase.model";
import { ExpertResponse, IExpertResponse } from "../models/ExpertResponse.model";
import { DiseaseDetection, IDiseaseDetection } from "../models/DiseaseDetection.model";
import { ISoilReport } from "../models/SoilReport.model";
import { CropCycle, ICropCycle } from "../models/CropCycle.model";
import { IFarm } from "../models/Farm.model";
import { User, IUser } from "../models/User.model";
import { Role } from "../constants/enums";
import { ApiError } from "../utils/ApiError";
import { getOwnedFarmOrThrow } from "./farm.service";
import { getById as getDetectionById } from "./disease.service";
import { getActiveCycle } from "./cropCycle.service";
import { getLatestByFarm } from "./soil.service";
import { getWeatherForFarm, WeatherResult } from "./weather.service";
import { createNotification } from "./notification.service";
import { logger } from "../utils/logger";
import { CreateCaseInput, ListCasesQuery, AddResponseInput } from "../validators/expert.validator";

// A farmer only ever escalates a case they own; an expert only ever
// touches a case once assigned (or claims an open one). This check exists
// so a farmer can't view/act on someone else's case and an expert can't
// see a case that both belongs to another farmer AND isn't open for
// anyone to pick up. Not found (not forbidden) to avoid leaking existence
// via status code, matching the rest of the codebase's ownership pattern.
function assertCaseAccess(expertCase: IExpertCase, userId: string, role: Role): void {
  if (role === "admin") return;
  if (role === "farmer" && expertCase.farmer.toString() === userId) return;
  if (role === "expert" && (expertCase.expert?.toString() === userId || expertCase.status === "open")) return;
  throw ApiError.notFound("Case not found");
}

export async function createCase(farmerId: string, input: CreateCaseInput): Promise<IExpertCase> {
  const farm = await getOwnedFarmOrThrow(input.farmId, farmerId);

  if (input.diseaseDetectionId) {
    await getDetectionById(input.diseaseDetectionId, farmerId);
  }

  return ExpertCase.create({
    farmer: farmerId,
    farm: farm._id,
    cropCycle: input.cropCycleId,
    diseaseDetection: input.diseaseDetectionId,
    subject: input.subject,
    description: input.description,
    priority: input.priority ?? "medium",
  });
}

export async function listMyCases(
  farmerId: string,
  query: ListCasesQuery
): Promise<{ cases: IExpertCase[]; total: number; page: number; limit: number }> {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const filter: Record<string, unknown> = { farmer: farmerId };
  if (query.status) filter.status = query.status;

  const [cases, total] = await Promise.all([
    ExpertCase.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ExpertCase.countDocuments(filter),
  ]);

  return { cases, total, page, limit };
}

export async function listExpertCases(
  expertId: string,
  query: ListCasesQuery
): Promise<{ cases: IExpertCase[]; total: number; page: number; limit: number }> {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 20, 100);
  const filter: Record<string, unknown> = query.assignedToMe
    ? { expert: expertId }
    : { $or: [{ expert: expertId }, { status: "open" }] };
  if (query.status) filter.status = query.status;

  const [cases, total] = await Promise.all([
    ExpertCase.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ExpertCase.countDocuments(filter),
  ]);

  return { cases, total, page, limit };
}

async function getCaseOrThrow(caseId: string): Promise<IExpertCase> {
  const expertCase = await ExpertCase.findById(caseId);
  if (!expertCase) throw ApiError.notFound("Case not found");
  return expertCase;
}

export interface CaseDetail {
  case: IExpertCase;
  farmer: IUser;
  farm: IFarm;
  cropCycle: ICropCycle | null;
  soilReport: ISoilReport | null;
  weather: WeatherResult | null;
  diseaseDetection: IDiseaseDetection | null;
  responses: IExpertResponse[];
}

export async function getCaseDetail(caseId: string, userId: string, role: Role): Promise<CaseDetail> {
  const expertCase = await getCaseOrThrow(caseId);
  assertCaseAccess(expertCase, userId, role);

  const farmerId = expertCase.farmer.toString();
  const farmId = expertCase.farm.toString();

  const [farmer, farm, cropCycle, soilReport, diseaseDetection, responses] = await Promise.all([
    User.findById(farmerId),
    getOwnedFarmOrThrow(farmId, farmerId),
    expertCase.cropCycle
      ? CropCycle.findById(expertCase.cropCycle).populate("crop")
      : getActiveCycle(farmId, farmerId),
    getLatestByFarm(farmId, farmerId),
    expertCase.diseaseDetection ? getDetectionById(expertCase.diseaseDetection.toString(), farmerId) : null,
    ExpertResponse.find({ case: caseId }).sort({ createdAt: 1 }),
  ]);

  let weather: WeatherResult | null = null;
  try {
    weather = await getWeatherForFarm(farmId, farmerId);
  } catch (err) {
    logger.warn("Expert case detail: weather unavailable, continuing without it", { farmId, err });
  }

  if (!farmer) throw ApiError.notFound("Farmer not found");

  return {
    case: expertCase,
    farmer,
    farm,
    cropCycle: cropCycle as ICropCycle | null,
    soilReport,
    weather,
    diseaseDetection: diseaseDetection as IDiseaseDetection | null,
    responses,
  };
}

export async function assignCase(caseId: string, expertId: string): Promise<IExpertCase> {
  const expertCase = await getCaseOrThrow(caseId);

  if (expertCase.status !== "open") {
    throw ApiError.badRequest("This case has already been assigned to an expert");
  }

  expertCase.expert = new Types.ObjectId(expertId);
  expertCase.status = "assigned";
  await expertCase.save();
  return expertCase;
}

export async function addResponse(
  caseId: string,
  expertId: string,
  input: AddResponseInput
): Promise<IExpertResponse> {
  const expertCase = await getCaseOrThrow(caseId);
  assertCaseAccess(expertCase, expertId, "expert");

  if (expertCase.status === "resolved" || expertCase.status === "closed") {
    throw ApiError.badRequest("This case is already closed");
  }

  // Responding to an open case implicitly claims it — an expert
  // shouldn't have to assign first and respond second for the common
  // path of picking up an unassigned case.
  if (expertCase.status === "open") {
    expertCase.expert = new Types.ObjectId(expertId);
  }
  if (expertCase.status === "open" || expertCase.status === "assigned") {
    expertCase.status = "in_progress";
  }
  await expertCase.save();

  const response = await ExpertResponse.create({
    case: caseId,
    expert: expertId,
    message: input.message,
    recommendation: input.recommendation,
  });

  if (expertCase.diseaseDetection) {
    await DiseaseDetection.findByIdAndUpdate(expertCase.diseaseDetection, {
      $set: { status: "reviewed_by_expert" },
    });
  }

  await createNotification({
    userId: expertCase.farmer.toString(),
    type: "general",
    title: "An expert responded to your case",
    message: `"${expertCase.subject}" has a new response from an agriculture expert.`,
  });

  return response;
}

export async function updateCaseStatus(
  caseId: string,
  userId: string,
  role: Role,
  status: "resolved" | "closed"
): Promise<IExpertCase> {
  const expertCase = await getCaseOrThrow(caseId);

  if (role !== "admin" && expertCase.expert?.toString() !== userId) {
    throw ApiError.forbidden("Only the assigned expert can update this case's status");
  }

  expertCase.status = status;
  await expertCase.save();

  if (status === "resolved") {
    await createNotification({
      userId: expertCase.farmer.toString(),
      type: "general",
      title: "Your case has been resolved",
      message: `"${expertCase.subject}" has been marked resolved by the expert.`,
    });
  }

  return expertCase;
}
