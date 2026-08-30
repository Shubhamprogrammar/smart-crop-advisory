import { Router } from "express";
import * as advisoryController from "../controllers/advisory.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import {
  advisoryIdParamSchema,
  farmIdParamSchema,
  updateAdvisoryStatusSchema,
} from "../validators/advisory.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.post(
  "/:farmId/generate",
  validate(farmIdParamSchema, "params"),
  catchAsync(advisoryController.generateAdvisories)
);

router.get(
  "/:farmId",
  validate(farmIdParamSchema, "params"),
  catchAsync(advisoryController.listActiveAdvisories)
);

router.get(
  "/:farmId/all",
  validate(farmIdParamSchema, "params"),
  catchAsync(advisoryController.listAllAdvisories)
);

router.patch(
  "/:id/status",
  validate(advisoryIdParamSchema, "params"),
  validate(updateAdvisoryStatusSchema),
  catchAsync(advisoryController.updateStatus)
);

export default router;
