import { Schema, model, Document, Types } from "mongoose";
import { CROP_STAGES, CropStage } from "../constants/enums";

const TASK_TYPES = [
  "fertilizer",
  "irrigation",
  "pest_monitoring",
  "disease_monitoring",
  "harvest",
  "general",
] as const;

interface CalendarTask {
  title: string;
  description?: string;
  type: (typeof TASK_TYPES)[number];
  dueDate?: Date;
  status: "pending" | "done" | "skipped";
  completedAt?: Date;
}

interface CalendarStage {
  name: CropStage;
  startDate?: Date;
  endDate?: Date;
  status: "upcoming" | "active" | "completed";
  tasks: CalendarTask[];
}

export interface ICropCalendar extends Document {
  _id: Types.ObjectId;
  cropCycle: Types.ObjectId;
  crop: Types.ObjectId;
  farm: Types.ObjectId;
  stages: CalendarStage[];
  createdAt: Date;
  updatedAt: Date;
}

const calendarTaskSchema = new Schema<CalendarTask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: TASK_TYPES, required: true },
    dueDate: { type: Date },
    status: { type: String, enum: ["pending", "done", "skipped"], default: "pending" },
    completedAt: { type: Date },
  },
  { _id: false }
);

const calendarStageSchema = new Schema<CalendarStage>(
  {
    name: { type: String, enum: CROP_STAGES, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ["upcoming", "active", "completed"], default: "upcoming" },
    tasks: { type: [calendarTaskSchema], default: [] },
  },
  { _id: false }
);

const cropCalendarSchema = new Schema<ICropCalendar>(
  {
    cropCycle: { type: Schema.Types.ObjectId, ref: "CropCycle", required: true, unique: true },
    crop: { type: Schema.Types.ObjectId, ref: "Crop", required: true },
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    stages: { type: [calendarStageSchema], default: [] },
  },
  { timestamps: true }
);

export const CropCalendar = model<ICropCalendar>("CropCalendar", cropCalendarSchema);
