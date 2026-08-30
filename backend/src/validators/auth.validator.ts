import { z } from "zod";
import { LANGUAGES } from "../constants/enums";

const phoneRegex = /^[0-9+\-\s]{7,15}$/;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email().optional(),
    phone: z.string().trim().regex(phoneRegex, "Invalid phone number").optional(),
    password: z.string().min(8).max(72),
    preferredLanguage: z.enum(LANGUAGES).optional(),
    farmingExperienceYears: z.number().min(0).max(100).optional(),
    location: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
