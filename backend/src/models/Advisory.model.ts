import { Schema, model, Document, Types } from "mongoose";
import { NOTIFICATION_TYPES, NotificationType, PRIORITY_LEVELS, PriorityLevel } from "../constants/enums";

export interface IAdvisory extends Document {
  _id: Types.ObjectId;
  farm: Types.ObjectId;
  farmer: Types.ObjectId;
  cropCycle?: Types.ObjectId;
  type: NotificationType;
  priority: PriorityLevel;
  title: string;
  reason: string;
  action: string;
  deadline?: Date;
  status: "active" | "acknowledged" | "dismissed" | "expired";
  generatedBy: "rule_engine" | "ml" | "llm" | "expert";
  sourceData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const advisorySchema = new Schema<IAdvisory>(
  {
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cropCycle: { type: Schema.Types.ObjectId, ref: "CropCycle" },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    priority: { type: String, enum: PRIORITY_LEVELS, required: true },
    title: { type: String, required: true, maxlength: 150 },
    reason: { type: String, required: true, maxlength: 1000 },
    action: { type: String, required: true, maxlength: 1000 },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["active", "acknowledged", "dismissed", "expired"],
      default: "active",
    },
    generatedBy: {
      type: String,
      enum: ["rule_engine", "ml", "llm", "expert"],
      default: "rule_engine",
    },
    sourceData: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

advisorySchema.index({ farm: 1, status: 1, createdAt: -1 });

export const Advisory = model<IAdvisory>("Advisory", advisorySchema);
