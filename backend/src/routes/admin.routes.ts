import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import {
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamSchema,
  createCropSchema,
  updateCropSchema,
  cropIdParamSchema,
  listAdvisoriesQuerySchema,
  listDiseaseDetectionsQuerySchema,
  updateRuleThresholdsSchema,
} from "../validators/admin.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/stats", catchAsync(adminController.getStats));

router.get("/users", validate(listUsersQuerySchema, "query"), catchAsync(adminController.listUsers));
router.patch(
  "/users/:id",
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema),
  catchAsync(adminController.updateUser)
);

router.get("/crops", catchAsync(adminController.listCrops));
router.post("/crops", validate(createCropSchema), catchAsync(adminController.createCrop));
router.patch(
  "/crops/:id",
  validate(cropIdParamSchema, "params"),
  validate(updateCropSchema),
  catchAsync(adminController.updateCrop)
);

router.get(
  "/advisories",
  validate(listAdvisoriesQuerySchema, "query"),
  catchAsync(adminController.listAdvisories)
);

router.get(
  "/diseases",
  validate(listDiseaseDetectionsQuerySchema, "query"),
  catchAsync(adminController.listDiseaseDetections)
);

router.get("/rules", catchAsync(adminController.getRuleThresholds));
router.patch(
  "/rules",
  validate(updateRuleThresholdsSchema),
  catchAsync(adminController.updateRuleThresholds)
);

export default router;
