import { GeoPoint } from "../models/schemas/geoPoint.schema";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export function toGeoPoint({ latitude, longitude }: LatLng): GeoPoint {
  return { type: "Point", coordinates: [longitude, latitude] };
}

export function fromGeoPoint(point?: GeoPoint): LatLng | undefined {
  if (!point) return undefined;
  const [longitude, latitude] = point.coordinates;
  return { latitude, longitude };
}
