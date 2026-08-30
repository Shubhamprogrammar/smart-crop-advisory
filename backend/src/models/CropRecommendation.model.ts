import { Schema, model, Document, Types } from "mongoose";

interface RecommendedCrop {
  crop?: Types.ObjectId;
  cropName: string;
  suitabilityScore: number;
  explanation: string;
  benefits: string[];
  risks: string[];
}

export interface ICropRecommendation extends Document {
  _id: Types.ObjectId;
  farm: Types.ObjectId;
  requestedBy: Types.ObjectId;
  inputSnapshot: {
    n?: number;
    p?: number;
    k?: number;
    ph?: number;
    temperature?: number;
    humidity?: number;
    rainfall?: number;
    season?: string;
    soilType?: string;
    waterAvailability?: string;
  };
  recommendations: RecommendedCrop[];
  modelVersion: string;
  source: "ml_model" | "pretrained_api";
  createdAt: Date;
  updatedAt: Date;
}

const recommendedCropSchema = new Schema<RecommendedCrop>(
  {
    crop: { type: Schema.Types.ObjectId, ref: "Crop" },
    cropName: { type: String, required: true },
    suitabilityScore: { type: Number, required: true, min: 0, max: 1 },
    explanation: { type: String, required: true },
    benefits: { type: [String], default: [] },
    risks: { type: [String], default: [] },
  },
  { _id: false }
);

const cropRecommendationSchema = new Schema<ICropRecommendation>(
  {
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    inputSnapshot: {
      n: Number,
      p: Number,
      k: Number,
      ph: Number,
      temperature: Number,
      humidity: Number,
      rainfall: Number,
      season: String,
      soilType: String,
      waterAvailability: String,
    },
    recommendations: { type: [recommendedCropSchema], default: [] },
    modelVersion: { type: String, required: true },
    source: { type: String, enum: ["ml_model", "pretrained_api"], required: true },
  },
  { timestamps: true }
);

cropRecommendationSchema.index({ farm: 1, createdAt: -1 });

export const CropRecommendation = model<ICropRecommendation>(
  "CropRecommendation",
  cropRecommendationSchema
);
