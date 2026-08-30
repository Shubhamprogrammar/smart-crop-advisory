import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeAdvisory } from "../utils/sanitizeAdvisory";
import * as advisoryService from "../services/advisory.service";
import { UpdateAdvisoryStatusInput } from "../validators/advisory.validator";

export async function generateAdvisories(req: Request, res: Response) {
  const advisories = await advisoryService.generateAdvisories(req.params.farmId, req.user!.id);
  return sendSuccess(res, {
    message: `${advisories.length} advisory(ies) active`,
    data: { advisories: advisories.map(sanitizeAdvisory) },
    statusCode: 201,
  });
}

export async function listActiveAdvisories(req: Request, res: Response) {
  const advisories = await advisoryService.listActiveAdvisories(req.params.farmId, req.user!.id);
  return sendSuccess(res, { message: "Active advisories fetched", data: { advisories: advisories.map(sanitizeAdvisory) } });
}

export async function listAllAdvisories(req: Request, res: Response) {
  const advisories = await advisoryService.listAllAdvisories(req.params.farmId, req.user!.id);
  return sendSuccess(res, { message: "Advisories fetched", data: { advisories: advisories.map(sanitizeAdvisory) } });
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = req.body as UpdateAdvisoryStatusInput;
  const advisory = await advisoryService.updateStatus(req.params.id, req.user!.id, status);
  return sendSuccess(res, { message: "Advisory updated", data: { advisory: sanitizeAdvisory(advisory) } });
}
