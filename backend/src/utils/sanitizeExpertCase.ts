import { IExpertCase } from "../models/ExpertCase.model";
import { IExpertResponse } from "../models/ExpertResponse.model";

export function sanitizeExpertCase(expertCase: IExpertCase) {
  return {
    id: expertCase._id.toString(),
    farmer: expertCase.farmer.toString(),
    expert: expertCase.expert?.toString(),
    farm: expertCase.farm.toString(),
    cropCycle: expertCase.cropCycle?.toString(),
    diseaseDetection: expertCase.diseaseDetection?.toString(),
    subject: expertCase.subject,
    description: expertCase.description,
    status: expertCase.status,
    priority: expertCase.priority,
    createdAt: expertCase.createdAt,
    updatedAt: expertCase.updatedAt,
  };
}

export function sanitizeExpertResponse(response: IExpertResponse) {
  return {
    id: response._id.toString(),
    case: response.case.toString(),
    expert: response.expert.toString(),
    message: response.message,
    recommendation: response.recommendation,
    attachments: response.attachments,
    createdAt: response.createdAt,
  };
}
