import { Router } from "express";
import * as farmController from "../controllers/farm.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import { createFarmSchema, farmIdParamSchema, updateFarmSchema } from "../validators/farm.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.post("/", validate(createFarmSchema), catchAsync(farmController.createFarm));
router.get("/", catchAsync(farmController.listFarms));
router.get("/:id", validate(farmIdParamSchema, "params"), catchAsync(farmController.getFarm));
router.patch(
  "/:id",
  validate(farmIdParamSchema, "params"),
  validate(updateFarmSchema),
  catchAsync(farmController.updateFarm)
);
router.delete("/:id", validate(farmIdParamSchema, "params"), catchAsync(farmController.deleteFarm));

export default router;
