import { Crop, ICrop } from "../models/Crop.model";
import { ApiError } from "../utils/ApiError";

export async function listCrops(): Promise<ICrop[]> {
  return Crop.find().sort({ name: 1 });
}

export async function getCropByName(name: string): Promise<ICrop> {
  const crop = await Crop.findOne({ name: name.toLowerCase() });
  if (!crop) {
    throw ApiError.notFound(`Crop "${name}" not found`);
  }
  return crop;
}
