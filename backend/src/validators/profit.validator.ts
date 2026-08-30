import { z } from "zod";

export const profitCalculatorSchema = z.object({
  landAreaAcres: z.number().min(0.01).max(100000).optional(),
  seedCost: z.number().min(0),
  fertilizerCost: z.number().min(0),
  pesticideCost: z.number().min(0),
  labourCost: z.number().min(0),
  irrigationCost: z.number().min(0),
  otherCosts: z.number().min(0).default(0),
  expectedYield: z.number().min(0),
  yieldUnit: z.string().trim().max(30).default("quintal"),
  marketPrice: z.number().min(0),
});

export type ProfitCalculatorInput = z.infer<typeof profitCalculatorSchema>;
