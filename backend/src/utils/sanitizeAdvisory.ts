import { IAdvisory } from "../models/Advisory.model";

export function sanitizeAdvisory(advisory: IAdvisory) {
  return {
    id: advisory._id.toString(),
    farm: advisory.farm.toString(),
    cropCycle: advisory.cropCycle?.toString(),
    type: advisory.type,
    priority: advisory.priority,
    title: advisory.title,
    reason: advisory.reason,
    action: advisory.action,
    deadline: advisory.deadline,
    status: advisory.status,
    generatedBy: advisory.generatedBy,
    createdAt: advisory.createdAt,
  };
}
