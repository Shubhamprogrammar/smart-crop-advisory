import { Farm, IFarm } from "../models/Farm.model";
import { ApiError } from "../utils/ApiError";
import { toGeoPoint } from "../utils/geo";
import { CreateFarmInput, UpdateFarmInput } from "../validators/farm.validator";

export async function getOwnedFarmOrThrow(farmId: string, ownerId: string): Promise<IFarm> {
  const farm = await Farm.findById(farmId);

  if (!farm || farm.owner.toString() !== ownerId) {
    throw ApiError.notFound("Farm not found");
  }

  return farm;
}

export async function createFarm(ownerId: string, input: CreateFarmInput): Promise<IFarm> {
  return Farm.create({
    owner: ownerId,
    name: input.name,
    landAreaAcres: input.landAreaAcres,
    location: toGeoPoint(input.location),
    address: input.address,
    soilType: input.soilType,
    irrigationType: input.irrigationType,
  });
}

export async function listMyFarms(ownerId: string): Promise<IFarm[]> {
  return Farm.find({ owner: ownerId }).sort({ createdAt: -1 });
}

export async function getFarm(farmId: string, ownerId: string): Promise<IFarm> {
  return getOwnedFarmOrThrow(farmId, ownerId);
}

export async function updateFarm(
  farmId: string,
  ownerId: string,
  input: UpdateFarmInput
): Promise<IFarm> {
  const farm = await getOwnedFarmOrThrow(farmId, ownerId);

  if (input.name !== undefined) farm.name = input.name;
  if (input.landAreaAcres !== undefined) farm.landAreaAcres = input.landAreaAcres;
  if (input.location !== undefined) farm.location = toGeoPoint(input.location);
  if (input.address !== undefined) farm.address = input.address;
  if (input.soilType !== undefined) farm.soilType = input.soilType;
  if (input.irrigationType !== undefined) farm.irrigationType = input.irrigationType;
  if (input.status !== undefined) farm.status = input.status;

  await farm.save();
  return farm;
}

export async function deleteFarm(farmId: string, ownerId: string): Promise<void> {
  const farm = await getOwnedFarmOrThrow(farmId, ownerId);
  await farm.deleteOne();
}
