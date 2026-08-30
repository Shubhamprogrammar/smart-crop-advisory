import { Router } from "express";
import * as soilController from "../controllers/soil.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { imageUpload } from "../middlewares/upload.middleware";
import { catchAsync } from "../utils/catchAsync";
import {
  farmIdParamSchema,
  manualSoilEntrySchema,
  soilReportIdParamSchema,
} from "../validators/soil.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.post(
  "/:farmId",
  validate(farmIdParamSchema, "params"),
  validate(manualSoilEntrySchema),
  catchAsync(soilController.createManualEntry)
);

router.post(
  "/:farmId/upload",
  validate(farmIdParamSchema, "params"),
  imageUpload.single("image"),
  catchAsync(soilController.uploadReport)
);

router.get("/:farmId", validate(farmIdParamSchema, "params"), catchAsync(soilController.listReports));

router.get(
  "/:farmId/latest",
  validate(farmIdParamSchema, "params"),
  catchAsync(soilController.getLatestReport)
);

router.get(
  "/report/:reportId",
  validate(soilReportIdParamSchema, "params"),
  catchAsync(soilController.getReportById)
);

export default router;
