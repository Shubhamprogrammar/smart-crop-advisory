import { Schema, model, Document, Types } from "mongoose";
import { RISK_LEVELS, RiskLevel } from "../constants/enums";

export interface IDiseaseRisk extends Document {
  _id: Types.ObjectId;
  cropCycle: Types.ObjectId;
  farm: Types.ObjectId;
  riskLevel: RiskLevel;
  reason: string;
  preventiveAction: string;
  weatherSnapshot?: {
    temperature?: number;
    humidity?: number;
    rainfall?: number;
  };
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const diseaseRiskSchema = new Schema<IDiseaseRisk>(
  {
    cropCycle: { type: Schema.Types.ObjectId, ref: "CropCycle", required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    riskLevel: { type: String, enum: RISK_LEVELS, required: true },
    reason: { type: String, required: true },
    preventiveAction: { type: String, required: true },
    weatherSnapshot: {
      temperature: Number,
      humidity: Number,
      rainfall: Number,
    },
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

diseaseRiskSchema.index({ cropCycle: 1, computedAt: -1 });

export const DiseaseRisk = model<IDiseaseRisk>("DiseaseRisk", diseaseRiskSchema);
