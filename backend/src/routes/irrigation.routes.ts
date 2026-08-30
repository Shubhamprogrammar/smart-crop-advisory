import { Router } from "express";
import * as irrigationController from "../controllers/irrigation.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import { farmIdParamSchema } from "../validators/irrigation.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.get(
  "/:farmId",
  validate(farmIdParamSchema, "params"),
  catchAsync(irrigationController.getRecommendation)
);

export default router;
