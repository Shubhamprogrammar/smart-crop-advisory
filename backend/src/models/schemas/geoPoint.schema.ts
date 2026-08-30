import { Schema } from "mongoose";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export const geoPointSchema = new Schema<GeoPoint>(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value: number[]) =>
          value.length === 2 &&
          value[0] >= -180 &&
          value[0] <= 180 &&
          value[1] >= -90 &&
          value[1] <= 90,
        message: "coordinates must be [longitude, latitude] within valid ranges",
      },
    },
  },
  { _id: false }
);
