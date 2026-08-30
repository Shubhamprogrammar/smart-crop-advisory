import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} from "../validators/notification.validator";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  validate(listNotificationsQuerySchema, "query"),
  catchAsync(notificationController.listNotifications)
);

router.get("/unread-count", catchAsync(notificationController.getUnreadCount));

router.patch("/read-all", catchAsync(notificationController.markAllAsRead));

router.patch(
  "/:id/read",
  validate(notificationIdParamSchema, "params"),
  catchAsync(notificationController.markAsRead)
);

router.delete(
  "/:id",
  validate(notificationIdParamSchema, "params"),
  catchAsync(notificationController.deleteNotification)
);

export default router;
