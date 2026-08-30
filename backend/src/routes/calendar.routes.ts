import { Router } from "express";
import * as calendarController from "../controllers/calendar.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import { cycleIdParamSchemaAlt, updateTaskSchema } from "../validators/cropCycle.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.get(
  "/:cycleId",
  validate(cycleIdParamSchemaAlt, "params"),
  catchAsync(calendarController.getCalendar)
);

router.patch(
  "/:cycleId/task",
  validate(cycleIdParamSchemaAlt, "params"),
  validate(updateTaskSchema),
  catchAsync(calendarController.updateTask)
);

export default router;
