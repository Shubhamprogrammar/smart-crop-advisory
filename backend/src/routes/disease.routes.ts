import { Router } from "express";
import * as diseaseController from "../controllers/disease.controller";
import * as diseaseRiskController from "../controllers/diseaseRisk.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { imageUpload } from "../middlewares/upload.middleware";
import { catchAsync } from "../utils/catchAsync";
import {
  detectDiseaseBodySchema,
  detectionIdParamSchema,
  farmIdParamSchema,
} from "../validators/disease.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.post(
  "/:farmId",
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
