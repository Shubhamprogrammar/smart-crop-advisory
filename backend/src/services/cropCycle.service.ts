import { CropCycle, ICropCycle } from "../models/CropCycle.model";
import { CropCalendar } from "../models/CropCalendar.model";
import { Crop } from "../models/Crop.model";
import { Farm } from "../models/Farm.model";
import { ApiError } from "../utils/ApiError";
import { generateCropCalendarStages } from "../utils/generateCropCalendar";
import { getOwnedFarmOrThrow } from "./farm.service";
import { CropStage, CROP_STAGES } from "../constants/enums";
import { StartCropCycleInput } from "../validators/cropCycle.validator";

const DEFAULT_GROWTH_DURATION_DAYS = 100;

export async function startCropCycle(
  farmId: string,
  ownerId: string,
  input: StartCropCycleInput
): Promise<ICropCycle> {
  const farm = await getOwnedFarmOrThrow(farmId, ownerId);

  if (farm.activeCropCycle) {
    const existingActive = await CropCycle.findOne({ _id: farm.activeCropCycle, status: "active" });
    if (existingActive) {
      throw ApiError.conflict(
        "This farm already has an active crop cycle. Complete or abandon it before starting a new one."
      );
    }
  }

  const crop = await Crop.findOne({ name: input.cropName.toLowerCase() });
  if (!crop) {
    throw ApiError.badRequest(`Unknown crop "${input.cropName}"`);
  }

  const sowingDate = input.sowingDate ? new Date(input.sowingDate) : new Date();
  const growthDurationDays = crop.growthDurationDays ?? DEFAULT_GROWTH_DURATION_DAYS;
  const expectedHarvestDate = new Date(sowingDate);
  expectedHarvestDate.setUTCDate(expectedHarvestDate.getUTCDate() + growthDurationDays);

  const cycle = await CropCycle.create({
    farm: farmId,
    crop: crop._id,
    farmer: ownerId,
    season: input.season,
    areaAcres: input.areaAcres,
    sowingDate,
    expectedHarvestDate,
    currentStage: "sowing",
    status: "active",
  });

  const stages = generateCropCalendarStages(sowingDate, growthDurationDays);
  await CropCalendar.create({
    cropCycle: cycle._id,
    crop: crop._id,
    farm: farmId,
    stages,
  });

  farm.activeCropCycle = cycle._id;
  await farm.save();

  return cycle;
}

export async function getActiveCycle(farmId: string, ownerId: string): Promise<ICropCycle | null> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  return CropCycle.findOne({ farm: farmId, status: "active" }).populate("crop");
}

export async function listCycles(farmId: string, ownerId: string): Promise<ICropCycle[]> {
  await getOwnedFarmOrThrow(farmId, ownerId);
  return CropCycle.find({ farm: farmId }).sort({ createdAt: -1 }).populate("crop");
}

export async function getOwnedCycleOrThrow(cycleId: string, ownerId: string): Promise<ICropCycle> {
  const cycle = await CropCycle.findById(cycleId);
  if (!cycle) {
    throw ApiError.notFound("Crop cycle not found");
  }
  await getOwnedFarmOrThrow(cycle.farm.toString(), ownerId);
  return cycle;
}

const STAGE_ORDER: CropStage[] = [...CROP_STAGES];

export async function advanceStage(
  cycleId: string,
  ownerId: string,
  newStage: CropStage
): Promise<ICropCycle> {
  const cycle = await getOwnedCycleOrThrow(cycleId, ownerId);

  if (cycle.status !== "active") {
    throw ApiError.badRequest("Only active crop cycles can be advanced");
  }

  cycle.currentStage = newStage;
  await cycle.save();

  const calendar = await CropCalendar.findOne({ cropCycle: cycle._id });
  if (calendar) {
    const newStageIndex = STAGE_ORDER.indexOf(newStage);
    calendar.stages.forEach((stage) => {
      const stageIndex = STAGE_ORDER.indexOf(stage.name);
      if (stageIndex < newStageIndex) stage.status = "completed";
      else if (stageIndex === newStageIndex) stage.status = "active";
      else stage.status = "upcoming";
    });
    await calendar.save();
  }

  return cycle;
}

export async function completeCycle(cycleId: string, ownerId: string): Promise<ICropCycle> {
  const cycle = await getOwnedCycleOrThrow(cycleId, ownerId);
  cycle.status = "completed";
  cycle.currentStage = "harvest";
  await cycle.save();

  const calendar = await CropCalendar.findOne({ cropCycle: cycle._id });
  if (calendar) {
    calendar.stages.forEach((stage) => {
      stage.status = "completed";
    });
    await calendar.save();
  }

  await Farm.updateOne({ _id: cycle.farm, activeCropCycle: cycle._id }, { $unset: { activeCropCycle: 1 } });

  return cycle;
}
