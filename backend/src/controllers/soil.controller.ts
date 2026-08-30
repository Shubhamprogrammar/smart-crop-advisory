import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeSoilReport } from "../utils/sanitizeSoilReport";
import { ApiError } from "../utils/ApiError";
import * as soilService from "../services/soil.service";
import { ManualSoilEntryInput } from "../validators/soil.validator";

export async function createManualEntry(req: Request, res: Response) {
  const input = req.body as ManualSoilEntryInput;
  const report = await soilService.createManualEntry(req.params.farmId, req.user!.id, input);
  return sendSuccess(res, {
    message: "Soil report recorded",
    data: { report: sanitizeSoilReport(report) },
    statusCode: 201,
  });
}

export async function uploadReport(req: Request, res: Response) {
  if (!req.file) {
    throw ApiError.badRequest("An image file is required");
  }

  const report = await soilService.createFromUpload(req.params.farmId, req.user!.id, req.file);
  return sendSuccess(res, {
    message: "Soil report uploaded",
    data: { report: sanitizeSoilReport(report) },
    statusCode: 201,
  });
}

export async function listReports(req: Request, res: Response) {
  const reports = await soilService.listByFarm(req.params.farmId, req.user!.id);
  return sendSuccess(res, {
    message: "Soil reports fetched",
    data: { reports: reports.map(sanitizeSoilReport) },
  });
}

export async function getLatestReport(req: Request, res: Response) {
  const report = await soilService.getLatestByFarm(req.params.farmId, req.user!.id);
  return sendSuccess(res, {
    message: report ? "Latest soil report fetched" : "No soil reports yet",
    data: { report: report ? sanitizeSoilReport(report) : null },
  });
}

export async function getReportById(req: Request, res: Response) {
  const report = await soilService.getReportById(req.params.reportId, req.user!.id);
  return sendSuccess(res, { message: "Soil report fetched", data: { report: sanitizeSoilReport(report) } });
}

export async function getReportImage(req: Request, res: Response) {
  const { buffer, contentType } = await soilService.getReportImageForUser(
    req.params.reportId,
    req.user!.id,
    req.user!.role
  );
  res.set("Content-Type", contentType);
  res.set("Cache-Control", "private, max-age=300");
  res.set("Cross-Origin-Resource-Policy", "cross-origin");
  res.send(buffer);
}
