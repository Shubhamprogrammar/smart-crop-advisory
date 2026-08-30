import { Router } from "express";
import * as recommendationController from "../controllers/recommendation.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import {
  cropRecommendationSchema,
  farmIdParamSchema,
  recommendationIdParamSchema,
} from "../validators/recommendation.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.post(
  "/crop/:farmId",
  validate(farmIdParamSchema, "params"),
  validate(cropRecommendationSchema),
  catchAsync(recommendationController.generateCropRecommendation)
);

router.get(
  "/farm/:farmId",
  validate(farmIdParamSchema, "params"),
  catchAsync(recommendationController.listRecommendations)
);

router.get(
  "/:id",
  validate(recommendationIdParamSchema, "params"),
  catchAsync(recommendationController.getRecommendation)
);

export default router;
