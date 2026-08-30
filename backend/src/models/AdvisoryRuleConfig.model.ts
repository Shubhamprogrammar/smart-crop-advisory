import { Schema, model, Document, Types } from "mongoose";

/**
 * Singleton document (exactly one row) holding the tunable thresholds for
 * the weather-based advisory rules (advisoryRules.ts). Per spec §16 ("Design
 * rules so they are configurable from the admin system"), these were
 * hardcoded module constants through Phase 10 — this model lets an admin
 * change them without a redeploy. Only the weather-threshold rules are
 * exposed this way; the soil/irrigation/disease rules consume upstream
 * engines (soil health score, irrigation engine, disease-risk assessment)
 * that already have their own tunable inputs, not raw thresholds here.
 */
export interface IAdvisoryRuleConfig extends Document {
  _id: Types.ObjectId;
  heavyRainProbability: number;
  heavyRainMm: number;
  strongWindKmh: number;
  heatStressC: number;
  coldStressC: number;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const advisoryRuleConfigSchema = new Schema<IAdvisoryRuleConfig>(
  {
    heavyRainProbability: { type: Number, required: true, min: 0, max: 100 },
    heavyRainMm: { type: Number, required: true, min: 0 },
    strongWindKmh: { type: Number, required: true, min: 0 },
    heatStressC: { type: Number, required: true },
    coldStressC: { type: Number, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const AdvisoryRuleConfig = model<IAdvisoryRuleConfig>(
  "AdvisoryRuleConfig",
  advisoryRuleConfigSchema
);
