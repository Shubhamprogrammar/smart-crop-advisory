import { Schema, model, Document, Types } from "mongoose";
import { GeoPoint, geoPointSchema } from "./schemas/geoPoint.schema";

export interface IWeatherData extends Document {
  _id: Types.ObjectId;
  location: GeoPoint;
  locationKey: string;
  date: Date;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  rainProbability?: number;
  windSpeed?: number;
  condition?: string;
  source: "api" | "cache";
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const weatherDataSchema = new Schema<IWeatherData>(
  {
    location: { type: geoPointSchema, required: true },
    locationKey: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    temperature: { type: Number },
    humidity: { type: Number, min: 0, max: 100 },
    rainfall: { type: Number, min: 0 },
    rainProbability: { type: Number, min: 0, max: 100 },
    windSpeed: { type: Number, min: 0 },
    condition: { type: String },
    source: { type: String, enum: ["api", "cache"], default: "api" },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

weatherDataSchema.index({ location: "2dsphere" });
weatherDataSchema.index({ locationKey: 1, date: 1 }, { unique: true });

export const WeatherData = model<IWeatherData>("WeatherData", weatherDataSchema);
