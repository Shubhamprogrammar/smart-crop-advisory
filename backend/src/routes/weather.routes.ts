import { Router } from "express";
import * as weatherController from "../controllers/weather.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import { farmIdParamSchema, weatherByLocationQuerySchema } from "../validators/weather.validator";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  validate(weatherByLocationQuerySchema, "query"),
  catchAsync(weatherController.getWeatherByLocation)
);

router.get(
  "/farm/:farmId",
  validate(farmIdParamSchema, "params"),
  catchAsync(weatherController.getWeatherForFarm)
);

export default router;
