import { Schema, model, Document, Types } from "mongoose";
import { PRIORITY_LEVELS, PriorityLevel } from "../constants/enums";

export interface IExpertCase extends Document {
  _id: Types.ObjectId;
  farmer: Types.ObjectId;
  expert?: Types.ObjectId;
  farm: Types.ObjectId;
  cropCycle?: Types.ObjectId;
  diseaseDetection?: Types.ObjectId;
  subject: string;
  description: string;
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed";
  priority: PriorityLevel;
  createdAt: Date;
  updatedAt: Date;
}

const expertCaseSchema = new Schema<IExpertCase>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expert: { type: Schema.Types.ObjectId, ref: "User", index: true },
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    cropCycle: { type: Schema.Types.ObjectId, ref: "CropCycle" },
    diseaseDetection: { type: Schema.Types.ObjectId, ref: "DiseaseDetection" },
    subject: { type: String, required: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["open", "assigned", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: { type: String, enum: PRIORITY_LEVELS, default: "medium" },
  },
  { timestamps: true }
);

expertCaseSchema.index({ status: 1, createdAt: -1 });
expertCaseSchema.index({ expert: 1, status: 1 });

export const ExpertCase = model<IExpertCase>("ExpertCase", expertCaseSchema);
