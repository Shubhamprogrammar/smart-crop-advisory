import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeDiseaseRisk } from "../utils/sanitizeDiseaseRisk";
import * as diseaseRiskService from "../services/diseaseRisk.service";

export async function computeRisk(req: Request, res: Response) {
  const { risk, stale } = await diseaseRiskService.computeDiseaseRisk(req.params.farmId, req.user!.id);
  return sendSuccess(res, {
    message: stale
      ? "Live disease risk assessment unavailable — showing the last computed assessment."
      : "Disease risk assessed",
    data: { risk: sanitizeDiseaseRisk(risk), stale },
    statusCode: stale ? 200 : 201,
  });
}

export async function getLatestRisk(req: Request, res: Response) {
  const risk = await diseaseRiskService.getLatestRisk(req.params.farmId, req.user!.id);
  return sendSuccess(res, {
    message: risk ? "Latest disease risk fetched" : "No disease risk assessment yet",
    data: { risk: risk ? sanitizeDiseaseRisk(risk) : null },
  });
}

export async function listRiskHistory(req: Request, res: Response) {
  const risks = await diseaseRiskService.listRiskHistory(req.params.farmId, req.user!.id);
  return sendSuccess(res, { message: "Disease risk history fetched", data: { risks: risks.map(sanitizeDiseaseRisk) } });
}
