import { ICropCycle } from "../models/CropCycle.model";
import { ICropCalendar } from "../models/CropCalendar.model";
import { ICrop } from "../models/Crop.model";

export function sanitizeCrop(crop: ICrop) {
  return {
    id: crop._id.toString(),
    name: crop.name,
    category: crop.category,
    seasons: crop.seasons,
    growthDurationDays: crop.growthDurationDays,
    diseaseDetectionSupported: crop.diseaseDetectionSupported,
    imageUrl: crop.imageUrl,
  };
}

export function sanitizeCropCycle(cycle: ICropCycle) {
  const crop = cycle.crop as unknown as ICrop | undefined;
  const isPopulated = crop && typeof crop === "object" && "name" in crop;

  return {
    id: cycle._id.toString(),
    farm: cycle.farm.toString(),
    crop: isPopulated ? sanitizeCrop(crop) : cycle.crop?.toString(),
    season: cycle.season,
    areaAcres: cycle.areaAcres,
    sowingDate: cycle.sowingDate,
    expectedHarvestDate: cycle.expectedHarvestDate,
    currentStage: cycle.currentStage,
    status: cycle.status,
    createdAt: cycle.createdAt,
  };
}

export function sanitizeCropCalendar(calendar: ICropCalendar) {
  return {
    id: calendar._id.toString(),
    cropCycle: calendar.cropCycle.toString(),
    crop: calendar.crop.toString(),
    farm: calendar.farm.toString(),
    stages: calendar.stages.map((stage) => ({
      name: stage.name,
      startDate: stage.startDate,
      endDate: stage.endDate,
      status: stage.status,
      tasks: stage.tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        type: task.type,
        dueDate: task.dueDate,
        status: task.status,
        completedAt: task.completedAt,
      })),
    })),
  };
}
