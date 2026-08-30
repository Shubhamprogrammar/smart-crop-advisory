import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeExpertCase, sanitizeExpertResponse } from "../utils/sanitizeExpertCase";
import { sanitizeUser } from "../utils/sanitizeUser";
import { sanitizeFarm } from "../utils/sanitizeFarm";
import { sanitizeCropCycle } from "../utils/sanitizeCropCycle";
import { sanitizeSoilReport } from "../utils/sanitizeSoilReport";
import { sanitizeDiseaseDetection } from "../utils/sanitizeDiseaseDetection";
import * as expertService from "../services/expert.service";
import { CreateCaseInput, ListCasesQuery, AddResponseInput, UpdateCaseStatusInput } from "../validators/expert.validator";

export async function createCase(req: Request, res: Response) {
  const input = req.body as CreateCaseInput;
  const expertCase = await expertService.createCase(req.user!.id, input);
  return sendSuccess(res, {
    message: "Case submitted to an agriculture expert",
    data: { case: sanitizeExpertCase(expertCase) },
    statusCode: 201,
  });
}

export async function listCases(req: Request, res: Response) {
  const query = req.query as unknown as ListCasesQuery;
  const result =
    req.user!.role === "expert"
      ? await expertService.listExpertCases(req.user!.id, query)
      : await expertService.listMyCases(req.user!.id, query);

  return sendSuccess(res, {
    message: "Cases fetched",
    data: {
      cases: result.cases.map(sanitizeExpertCase),
      total: result.total,
      page: result.page,
      limit: result.limit,
    },
  });
}

export async function getCaseDetail(req: Request, res: Response) {
  const detail = await expertService.getCaseDetail(req.params.id, req.user!.id, req.user!.role);
  return sendSuccess(res, {
    message: "Case detail fetched",
    data: {
      case: sanitizeExpertCase(detail.case),
      farmer: sanitizeUser(detail.farmer),
      farm: sanitizeFarm(detail.farm),
      cropCycle: detail.cropCycle ? sanitizeCropCycle(detail.cropCycle) : null,
      soilReport: detail.soilReport ? sanitizeSoilReport(detail.soilReport) : null,
      weather: detail.weather,
      diseaseDetection: detail.diseaseDetection ? sanitizeDiseaseDetection(detail.diseaseDetection) : null,
      responses: detail.responses.map(sanitizeExpertResponse),
    },
  });
}

export async function assignCase(req: Request, res: Response) {
  const expertCase = await expertService.assignCase(req.params.id, req.user!.id);
  return sendSuccess(res, { message: "Case assigned to you", data: { case: sanitizeExpertCase(expertCase) } });
}

export async function addResponse(req: Request, res: Response) {
  const input = req.body as AddResponseInput;
  const response = await expertService.addResponse(req.params.id, req.user!.id, input);
  return sendSuccess(res, {
    message: "Response added",
    data: { response: sanitizeExpertResponse(response) },
    statusCode: 201,
  });
}

export async function updateCaseStatus(req: Request, res: Response) {
  const { status } = req.body as UpdateCaseStatusInput;
  const expertCase = await expertService.updateCaseStatus(req.params.id, req.user!.id, req.user!.role, status);
  return sendSuccess(res, { message: "Case status updated", data: { case: sanitizeExpertCase(expertCase) } });
}
