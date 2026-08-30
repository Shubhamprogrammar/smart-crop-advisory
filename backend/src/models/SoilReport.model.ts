import { Schema, model, Document, Types } from "mongoose";

export interface ISoilReport extends Document {
  _id: Types.ObjectId;
  farm: Types.ObjectId;
  source: "manual" | "upload_ocr";
  reportImageUrl?: string;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  ph?: number;
  organicCarbon?: number;
  moisture?: number;
  healthScore?: number;
  interpretation?: string;
  fertilizerRecommendation?: string;
  ocrRawText?: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const soilReportSchema = new Schema<ISoilReport>(
  {
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    source: { type: String, enum: ["manual", "upload_ocr"], required: true },
    reportImageUrl: { type: String },
    nitrogen: { type: Number, min: 0 },
    phosphorus: { type: Number, min: 0 },
    potassium: { type: Number, min: 0 },
    ph: { type: Number, min: 0, max: 14 },
    organicCarbon: { type: Number, min: 0 },
    moisture: { type: Number, min: 0, max: 100 },
    healthScore: { type: Number, min: 0, max: 100 },
    interpretation: { type: String, maxlength: 2000 },
    fertilizerRecommendation: { type: String, maxlength: 2000 },
    ocrRawText: { type: String },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

soilReportSchema.index({ farm: 1, recordedAt: -1 });

export const SoilReport = model<ISoilReport>("SoilReport", soilReportSchema);
