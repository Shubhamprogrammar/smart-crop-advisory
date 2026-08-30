import { IDiseaseRisk } from "../models/DiseaseRisk.model";

export function sanitizeDiseaseRisk(risk: IDiseaseRisk) {
  return {
    id: risk._id.toString(),
    cropCycle: risk.cropCycle.toString(),
    farm: risk.farm.toString(),
    riskLevel: risk.riskLevel,
    reason: risk.reason,
    preventiveAction: risk.preventiveAction,
    weatherSnapshot: risk.weatherSnapshot,
    computedAt: risk.computedAt,
  };
}
