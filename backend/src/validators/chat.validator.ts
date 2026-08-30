import { z } from "zod";
import { LANGUAGES } from "../constants/enums";
import { objectIdParamSchema } from "./common.validator";

export const createChatSchema = z.object({
  farmId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  language: z.enum(LANGUAGES).optional(),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const chatIdParamSchema = objectIdParamSchema("chatId");
