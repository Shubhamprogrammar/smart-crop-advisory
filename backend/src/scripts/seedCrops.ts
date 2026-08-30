/**
 * Seeds the `crops` reference catalog with the 22 crops the trained crop
 * recommendation model can predict (Phase 6), so recommendations can link
 * to a real Crop document. Season tags are general India-context
 * classifications (kharif/rabi/zaid/perennial) -- categorical knowledge,
 * not fabricated numeric claims. Idempotent: safe to re-run.
 *
 * Run: npx tsx src/scripts/seedCrops.ts   (with MONGO_URI set in .env)
 */
import mongoose from "mongoose";
import { env } from "../config/env";
import { Crop } from "../models/Crop.model";
import { logger } from "../utils/logger";

const CROPS: { name: string; category: string; seasons: string[]; diseaseDetectionSupported?: boolean }[] = [
  { name: "rice", category: "cereal", seasons: ["kharif"], diseaseDetectionSupported: true },
  { name: "maize", category: "cereal", seasons: ["kharif", "rabi"], diseaseDetectionSupported: true },
  { name: "chickpea", category: "pulse", seasons: ["rabi"] },
  { name: "kidneybeans", category: "pulse", seasons: ["kharif"] },
  { name: "pigeonpeas", category: "pulse", seasons: ["kharif"] },
  { name: "mothbeans", category: "pulse", seasons: ["kharif"] },
  { name: "mungbean", category: "pulse", seasons: ["kharif", "zaid"] },
  { name: "blackgram", category: "pulse", seasons: ["kharif"] },
  { name: "lentil", category: "pulse", seasons: ["rabi"] },
  { name: "pomegranate", category: "fruit", seasons: ["perennial"] },
  { name: "banana", category: "fruit", seasons: ["perennial"] },
  { name: "mango", category: "fruit", seasons: ["perennial"] },
  { name: "grapes", category: "fruit", seasons: ["perennial"] },
  { name: "watermelon", category: "fruit", seasons: ["zaid"] },
  { name: "muskmelon", category: "fruit", seasons: ["zaid"] },
  { name: "apple", category: "fruit", seasons: ["perennial"] },
  { name: "orange", category: "fruit", seasons: ["perennial"] },
  { name: "papaya", category: "fruit", seasons: ["perennial"] },
  { name: "coconut", category: "plantation", seasons: ["perennial"] },
  { name: "cotton", category: "fiber", seasons: ["kharif"], diseaseDetectionSupported: true },
  { name: "jute", category: "fiber", seasons: ["kharif"] },
  { name: "coffee", category: "plantation", seasons: ["perennial"] },
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
