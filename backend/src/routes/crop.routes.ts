import { Router } from "express";
import * as cropController from "../controllers/crop.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import {
  advanceStageSchema,
  cycleIdParamSchema,
  farmIdParamSchema,
  startCropCycleSchema,
} from "../validators/cropCycle.validator";

const router = Router();

router.use(requireAuth);

router.get("/", catchAsync(cropController.listCrops));
router.get("/:name", catchAsync(cropController.getCrop));

router.use(requireRole("farmer"));

router.post(
  "/cycle/:farmId",
  validate(farmIdParamSchema, "params"),
  validate(startCropCycleSchema),
  catchAsync(cropController.startCropCycle)
);

router.get(
  "/cycle/:farmId",
  validate(farmIdParamSchema, "params"),
  catchAsync(cropController.getActiveCycle)
);

router.get(
  "/cycle/:farmId/history",
  validate(farmIdParamSchema, "params"),
  catchAsync(cropController.listCycles)
);

router.patch(
  "/cycle/:id/stage",
  validate(cycleIdParamSchema, "params"),
  validate(advanceStageSchema),
  catchAsync(cropController.advanceStage)
);

router.post(
  "/cycle/:id/complete",
  validate(cycleIdParamSchema, "params"),
  catchAsync(cropController.completeCycle)
);

export default router;
