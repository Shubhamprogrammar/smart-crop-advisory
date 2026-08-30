import { Schema, model, Document, Types } from "mongoose";
import { DATA_SOURCE, DataSource } from "../constants/enums";

export interface IMarketPrice extends Document {
  _id: Types.ObjectId;
  crop: Types.ObjectId;
  cropName: string;
  market: string;
  state?: string;
  district?: string;
  date: Date;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

const marketPriceSchema = new Schema<IMarketPrice>(
  {
    crop: { type: Schema.Types.ObjectId, ref: "Crop", required: true, index: true },
    cropName: { type: String, required: true },
    market: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    date: { type: Date, required: true },
    minPrice: { type: Number, required: true, min: 0 },
    maxPrice: { type: Number, required: true, min: 0 },
    modalPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "quintal" },
    source: { type: String, enum: DATA_SOURCE, required: true, default: "real_data" },
  },
  { timestamps: true }
);

marketPriceSchema.index({ crop: 1, market: 1, date: -1 });

export const MarketPrice = model<IMarketPrice>("MarketPrice", marketPriceSchema);
