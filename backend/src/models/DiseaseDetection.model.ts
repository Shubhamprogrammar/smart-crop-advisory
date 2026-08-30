import { Schema, model, Document, Types } from "mongoose";
import { RISK_LEVELS, RiskLevel, SUPPORTED_DISEASE_CROPS } from "../constants/enums";

export interface IDiseaseDetection extends Document {
  _id: Types.ObjectId;
  cropCycle?: Types.ObjectId;
  farm: Types.ObjectId;
  farmer: Types.ObjectId;
  imageUrl: string;
  cropType: string;
  predictedDisease?: string;
  confidence?: number;
  severity?: RiskLevel;
  symptoms: string[];
  possibleCauses: string[];
  prevention: string[];
  treatment: string[];
  recommendedAction: string;
  isConfident: boolean;
  modelVersion: string;
  status: "pending" | "reviewed_by_expert";
  createdAt: Date;
  updatedAt: Date;
}

const diseaseDetectionSchema = new Schema<IDiseaseDetection>(
  {
    cropCycle: { type: Schema.Types.ObjectId, ref: "CropCycle", index: true },
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    imageUrl: { type: String, required: true },
    cropType: { type: String, required: true, enum: SUPPORTED_DISEASE_CROPS },
    predictedDisease: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    severity: { type: String, enum: RISK_LEVELS },
    symptoms: { type: [String], default: [] },
    possibleCauses: { type: [String], default: [] },
    prevention: { type: [String], default: [] },
    treatment: { type: [String], default: [] },
    recommendedAction: {
      type: String,
      required: true,
      default:
        "Unable to confidently identify the disease. Please upload a clearer image or consult an agriculture expert.",
    },
    isConfident: { type: Boolean, default: false },
    modelVersion: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed_by_expert"], default: "pending" },
  },
  { timestamps: true }
);

diseaseDetectionSchema.index({ farm: 1, createdAt: -1 });

export const DiseaseDetection = model<IDiseaseDetection>(
  "DiseaseDetection",
  diseaseDetectionSchema
);
