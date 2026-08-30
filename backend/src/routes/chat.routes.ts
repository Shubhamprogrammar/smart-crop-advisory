import { Router } from "express";
import * as chatController from "../controllers/chat.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { catchAsync } from "../utils/catchAsync";
import { chatIdParamSchema, createChatSchema, sendMessageSchema } from "../validators/chat.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole("farmer"));

router.post("/", validate(createChatSchema), catchAsync(chatController.createChat));
router.get("/", catchAsync(chatController.listChats));

router.get(
  "/:chatId/messages",
  validate(chatIdParamSchema, "params"),
  catchAsync(chatController.getMessages)
);

router.post(
  "/:chatId/messages",
  validate(chatIdParamSchema, "params"),
  validate(sendMessageSchema),
  catchAsync(chatController.sendMessage)
);

export default router;
