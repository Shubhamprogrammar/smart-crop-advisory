import { z } from "zod";
import { objectIdParamSchema } from "./common.validator";

export const listNotificationsQuerySchema = z.object({
  unreadOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export const notificationIdParamSchema = objectIdParamSchema("id");
