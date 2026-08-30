import { Router } from "express";
import * as diseaseController from "../controllers/disease.controller";
import * as diseaseRiskController from "../controllers/diseaseRisk.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { imageUpload } from "../middlewares/upload.middleware";
import { aiLimiter } from "../middlewares/rateLimiter";
import { catchAsync } from "../utils/catchAsync";
import {
  detectDiseaseBodySchema,
  detectionIdParamSchema,
  farmIdParamSchema,
} from "../validators/disease.validator";

const router = Router();

router.use(requireAuth);

// The image route is deliberately outside the farmer-only block below —
// an assigned/eligible expert and admin also need to view it (Phase 20),
// and the actual ownership/case-access check happens in the service
// layer (disease.service.ts's getImageForUser), not here.
router.get(
  "/detection/:id/image",
  requireRole("farmer", "expert", "admin"),
  validate(detectionIdParamSchema, "params"),
  catchAsync(diseaseController.getDetectionImage)
);

router.use(requireRole("farmer"));

router.post(
  "/:farmId",
  aiLimiter,
  validate(farmIdParamSchema, "params"),
  imageUpload.single("image"),
  validate(detectDiseaseBodySchema),
  catchAsync(diseaseController.detectDisease)
);

router.get(
  "/:farmId",
  validate(farmIdParamSchema, "params"),
  catchAsync(diseaseController.listDetections)
);

router.get(
  "/detection/:id",
  validate(detectionIdParamSchema, "params"),
  catchAsync(diseaseController.getDetection)
);

router.post(
  "/risk/:farmId",
  validate(farmIdParamSchema, "params"),
  catchAsync(diseaseRiskController.computeRisk)
);

router.get(
  "/risk/:farmId/latest",
  validate(farmIdParamSchema, "params"),
  catchAsync(diseaseRiskController.getLatestRisk)
);

router.get(
  "/risk/:farmId/history",
  validate(farmIdParamSchema, "params"),
  catchAsync(diseaseRiskController.listRiskHistory)
);

export default router;
