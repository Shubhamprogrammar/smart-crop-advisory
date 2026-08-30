import { Schema, model, Document, Types } from "mongoose";
import { CROP_STAGES, CropStage } from "../constants/enums";

export interface ICropCycle extends Document {
  _id: Types.ObjectId;
  farm: Types.ObjectId;
  crop: Types.ObjectId;
  farmer: Types.ObjectId;
  season?: string;
  areaAcres?: number;
  sowingDate: Date;
  expectedHarvestDate?: Date;
  currentStage: CropStage;
  status: "active" | "completed" | "abandoned";
  createdAt: Date;
  updatedAt: Date;
}

const cropCycleSchema = new Schema<ICropCycle>(
  {
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    crop: { type: Schema.Types.ObjectId, ref: "Crop", required: true },
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    season: { type: String, trim: true },
    areaAcres: { type: Number, min: 0.01 },
    sowingDate: { type: Date, required: true },
    expectedHarvestDate: { type: Date },
    currentStage: { type: String, enum: CROP_STAGES, default: "sowing" },
    status: { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
  },
  { timestamps: true }
);

cropCycleSchema.index({ farm: 1, status: 1 });

export const CropCycle = model<ICropCycle>("CropCycle", cropCycleSchema);
