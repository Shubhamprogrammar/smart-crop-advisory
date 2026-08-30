import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeUser } from "../utils/sanitizeUser";
import { sanitizeCrop } from "../utils/sanitizeCropCycle";
import * as adminService from "../services/admin.service";
import * as cropService from "../services/crop.service";
import {
  ListUsersQuery,
  UpdateUserInput,
  CreateCropInput,
  UpdateCropInput,
  ListAdvisoriesQuery,
  ListDiseaseDetectionsQuery,
  UpdateRuleThresholdsInput,
} from "../validators/admin.validator";

export async function getStats(_req: Request, res: Response) {
  const stats = await adminService.getDashboardStats();
  return sendSuccess(res, { message: "Admin stats fetched", data: stats });
}

// --- Users -----------------------------------------------------------------

export async function listUsers(req: Request, res: Response) {
  const query = req.query as unknown as ListUsersQuery;
  const { users, total, page, limit } = await adminService.listUsers(query);
  return sendSuccess(res, {
    message: "Users fetched",
    data: { users: users.map(sanitizeUser), total, page, limit },
  });
}

export async function updateUser(req: Request, res: Response) {
  const input = req.body as UpdateUserInput;
  const user = await adminService.updateUser(req.params.id, input, req.user!.id);
  return sendSuccess(res, { message: "User updated", data: { user: sanitizeUser(user) } });
}

// --- Crops -------------------------------------------------------------

export async function listCrops(_req: Request, res: Response) {
  const crops = await cropService.listCrops();
  return sendSuccess(res, { message: "Crops fetched", data: { crops: crops.map(sanitizeCrop) } });
}

export async function createCrop(req: Request, res: Response) {
  const input = req.body as CreateCropInput;
  const crop = await adminService.createCrop(input);
  return sendSuccess(res, { message: "Crop created", data: { crop: sanitizeCrop(crop) }, statusCode: 201 });
}

export async function updateCrop(req: Request, res: Response) {
  const input = req.body as UpdateCropInput;
  const crop = await adminService.updateCrop(req.params.id, input);
  return sendSuccess(res, { message: "Crop updated", data: { crop: sanitizeCrop(crop) } });
}

// --- Advisories --------------------------------------------------------

export async function listAdvisories(req: Request, res: Response) {
  const query = req.query as unknown as ListAdvisoriesQuery;
  const { advisories, total, page, limit } = await adminService.listAdvisories(query);
  return sendSuccess(res, {
    message: "Advisories fetched",
    data: { advisories: advisories.map(adminService.sanitizeAdvisoryAdmin), total, page, limit },
  });
}

// --- Disease detections ----------------------------------------------------

export async function listDiseaseDetections(req: Request, res: Response) {
  const query = req.query as unknown as ListDiseaseDetectionsQuery;
  const { detections, total, page, limit } = await adminService.listDiseaseDetections(query);
  return sendSuccess(res, {
    message: "Disease detections fetched",
    data: { detections: detections.map(adminService.sanitizeDiseaseDetectionAdmin), total, page, limit },
  });
}

// --- Advisory rule thresholds ------------------------------------------

export async function getRuleThresholds(_req: Request, res: Response) {
  const thresholds = await adminService.getRuleThresholds();
  return sendSuccess(res, { message: "Advisory rule thresholds fetched", data: { thresholds } });
}

export async function updateRuleThresholds(req: Request, res: Response) {
  const input = req.body as UpdateRuleThresholdsInput;
  const thresholds = await adminService.updateRuleThresholds(input, req.user!.id);
  return sendSuccess(res, { message: "Advisory rule thresholds updated", data: { thresholds } });
}
