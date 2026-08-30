import { IFarm } from "../models/Farm.model";
import { fromGeoPoint } from "./geo";

export function sanitizeFarm(farm: IFarm) {
  return {
    id: farm._id.toString(),
    name: farm.name,
    landAreaAcres: farm.landAreaAcres,
    location: fromGeoPoint(farm.location),
    address: farm.address,
    soilType: farm.soilType,
    irrigationType: farm.irrigationType,
    activeCropCycle: farm.activeCropCycle?.toString(),
    status: farm.status,
    createdAt: farm.createdAt,
    updatedAt: farm.updatedAt,
  };
}
