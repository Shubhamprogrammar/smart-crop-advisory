import { z } from "zod";
import { LANGUAGES } from "../constants/enums";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  preferredLanguage: z.enum(LANGUAGES).optional(),
  farmingExperienceYears: z.number().min(0).max(100).optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
