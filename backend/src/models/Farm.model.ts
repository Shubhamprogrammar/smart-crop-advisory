import { Schema, model, Document, Types } from "mongoose";
import { IRRIGATION_TYPES, IrrigationType } from "../constants/enums";
import { GeoPoint, geoPointSchema } from "./schemas/geoPoint.schema";

export interface IFarm extends Document {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  name: string;
  landAreaAcres: number;
  location: GeoPoint;
  address?: string;
  soilType?: string;
  irrigationType: IrrigationType;
  activeCropCycle?: Types.ObjectId;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const farmSchema = new Schema<IFarm>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    landAreaAcres: { type: Number, required: true, min: 0.01 },
    location: { type: geoPointSchema, required: true },
    address: { type: String, trim: true, maxlength: 250 },
    soilType: { type: String, trim: true },
    irrigationType: { type: String, enum: IRRIGATION_TYPES, default: "rainfed" },
    activeCropCycle: { type: Schema.Types.ObjectId, ref: "CropCycle" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

farmSchema.index({ location: "2dsphere" });
farmSchema.index({ owner: 1, status: 1 });

export const Farm = model<IFarm>("Farm", farmSchema);
