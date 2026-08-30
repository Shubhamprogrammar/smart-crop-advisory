/**
 * Seeds the `crops` reference catalog: the 22 crops the trained crop
 * recommendation model can predict (Phase 6), plus tomato/potato/wheat
 * (needed for Phase 8 disease detection and the spec's own demo scenario,
 * which names tomato explicitly, even though it isn't one of the 22
 * recommendation-model classes). Season tags are general India-context
 * classifications (kharif/rabi/zaid/perennial) — categorical knowledge,
 * not fabricated precision.
 *
 * growthDurationDays is a general, widely-cited typical sowing/planting-to
 * -harvest duration used only to lay out a crop calendar's stage dates
 * (Phase 7) -- an approximate planning default, not a precise agronomic
 * claim; actual duration varies by variety, region, and season. For
 * perennial crops it represents a mature plant's typical flowering-to-
 * harvest cycle, not the multi-year establishment period.
 *
 * Idempotent: safe to re-run.
 * Run: npx tsx src/scripts/seedCrops.ts   (with MONGO_URI set in .env)
 */
import mongoose from "mongoose";
import { env } from "../config/env";
import { Crop } from "../models/Crop.model";
import { logger } from "../utils/logger";

interface CropSeed {
  name: string;
  category: string;
  seasons: string[];
  growthDurationDays: number;
  diseaseDetectionSupported?: boolean;
}

const CROPS: CropSeed[] = [
  { name: "rice", category: "cereal", seasons: ["kharif"], growthDurationDays: 120, diseaseDetectionSupported: true },
  { name: "maize", category: "cereal", seasons: ["kharif", "rabi"], growthDurationDays: 100, diseaseDetectionSupported: true },
  { name: "wheat", category: "cereal", seasons: ["rabi"], growthDurationDays: 120, diseaseDetectionSupported: true },
  { name: "tomato", category: "vegetable", seasons: ["kharif", "rabi", "zaid"], growthDurationDays: 90, diseaseDetectionSupported: true },
  { name: "potato", category: "vegetable", seasons: ["rabi"], growthDurationDays: 100, diseaseDetectionSupported: true },
  { name: "chickpea", category: "pulse", seasons: ["rabi"], growthDurationDays: 100 },
  { name: "kidneybeans", category: "pulse", seasons: ["kharif"], growthDurationDays: 90 },
  { name: "pigeonpeas", category: "pulse", seasons: ["kharif"], growthDurationDays: 150 },
  { name: "mothbeans", category: "pulse", seasons: ["kharif"], growthDurationDays: 75 },
  { name: "mungbean", category: "pulse", seasons: ["kharif", "zaid"], growthDurationDays: 65 },
  { name: "blackgram", category: "pulse", seasons: ["kharif"], growthDurationDays: 80 },
  { name: "lentil", category: "pulse", seasons: ["rabi"], growthDurationDays: 110 },
  { name: "pomegranate", category: "fruit", seasons: ["perennial"], growthDurationDays: 180 },
  { name: "banana", category: "fruit", seasons: ["perennial"], growthDurationDays: 300 },
  { name: "mango", category: "fruit", seasons: ["perennial"], growthDurationDays: 150 },
  { name: "grapes", category: "fruit", seasons: ["perennial"], growthDurationDays: 150 },
  { name: "watermelon", category: "fruit", seasons: ["zaid"], growthDurationDays: 90 },
  { name: "muskmelon", category: "fruit", seasons: ["zaid"], growthDurationDays: 90 },
  { name: "apple", category: "fruit", seasons: ["perennial"], growthDurationDays: 180 },
  { name: "orange", category: "fruit", seasons: ["perennial"], growthDurationDays: 300 },
  { name: "papaya", category: "fruit", seasons: ["perennial"], growthDurationDays: 270 },
  { name: "coconut", category: "plantation", seasons: ["perennial"], growthDurationDays: 365 },
  { name: "cotton", category: "fiber", seasons: ["kharif"], growthDurationDays: 180, diseaseDetectionSupported: true },
  { name: "jute", category: "fiber", seasons: ["kharif"], growthDurationDays: 120 },
  { name: "coffee", category: "plantation", seasons: ["perennial"], growthDurationDays: 365 },
];

async function main() {
  await mongoose.connect(env.MONGO_URI);
  logger.info("Connected for crop seeding");

  let created = 0;
  let updated = 0;

  for (const crop of CROPS) {
    const existed = await Crop.exists({ name: crop.name });
    await Crop.findOneAndUpdate(
      { name: crop.name },
      {
        $set: {
          category: crop.category,
          seasons: crop.seasons,
          growthDurationDays: crop.growthDurationDays,
          diseaseDetectionSupported: crop.diseaseDetectionSupported ?? false,
        },
      },
      { upsert: true, new: true }
    );
    if (existed) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  logger.info(`Crop seeding complete: ${created} created, ${updated} updated`);
  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error("Crop seeding failed", { err });
  process.exit(1);
});
