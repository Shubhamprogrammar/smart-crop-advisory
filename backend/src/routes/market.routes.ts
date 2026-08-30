import { Router } from "express";
import * as marketController from "../controllers/market.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import {
  cropNameParamSchema,
  farmIdParamSchema,
  farmQuerySchema,
  marketQuerySchema,
} from "../validators/market.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.get(
  "/price/:cropName",
  validate(cropNameParamSchema, "params"),
  validate(marketQuerySchema, "query"),
  catchAsync(marketController.getCurrentPrice)
);

router.get(
  "/history/:cropName",
  validate(cropNameParamSchema, "params"),
  validate(marketQuerySchema, "query"),
  catchAsync(marketController.getHistory)
);

router.get(
  "/trend/:cropName",
  validate(cropNameParamSchema, "params"),
  validate(marketQuerySchema, "query"),
  catchAsync(marketController.getTrend)
);

router.get(
  "/nearby/:farmId",
  validate(farmIdParamSchema, "params"),
  catchAsync(marketController.getNearbyMandis)
);

router.get(
  "/compare/:cropName",
  validate(cropNameParamSchema, "params"),
  validate(farmQuerySchema, "query"),
  catchAsync(marketController.getMarketComparison)
);

router.get(
  "/recommendation/:cropName",
  validate(cropNameParamSchema, "params"),
  validate(farmQuerySchema, "query"),
  catchAsync(marketController.getSellingRecommendation)
);

export default router;
