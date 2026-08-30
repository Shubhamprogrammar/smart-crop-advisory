import { z } from "zod";
import { objectIdParamSchema } from "./common.validator";

export const weatherByLocationQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export type WeatherByLocationQuery = z.infer<typeof weatherByLocationQuerySchema>;

export const farmIdParamSchema = objectIdParamSchema("farmId");
