import { Schema, model, Document, Types } from "mongoose";
import { SEASONS, Season } from "../constants/enums";

interface Range {
  min?: number;
  max?: number;
}

export interface ICrop extends Document {
  _id: Types.ObjectId;
  name: string;
  localNames?: { hi?: string; mr?: string; gu?: string };
  category?: string;
  seasons: Season[];
  idealN?: Range;
  idealP?: Range;
  idealK?: Range;
  idealPh?: Range;
  idealTemperature?: Range;
  idealRainfall?: Range;
  growthDurationDays?: number;
  diseaseDetectionSupported: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rangeSchema = new Schema<Range>({ min: Number, max: Number }, { _id: false });

const cropSchema = new Schema<ICrop>(
  {
    name: { type: String, required: true, trim: true, unique: true, lowercase: true },
    localNames: {
      hi: { type: String, trim: true },
      mr: { type: String, trim: true },
      gu: { type: String, trim: true },
    },
    category: { type: String, trim: true },
    seasons: { type: [String], enum: SEASONS, default: [] },
    idealN: rangeSchema,
    idealP: rangeSchema,
    idealK: rangeSchema,
    idealPh: rangeSchema,
    idealTemperature: rangeSchema,
    idealRainfall: rangeSchema,
    growthDurationDays: { type: Number, min: 1 },
    diseaseDetectionSupported: { type: Boolean, default: false },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const Crop = model<ICrop>("Crop", cropSchema);
