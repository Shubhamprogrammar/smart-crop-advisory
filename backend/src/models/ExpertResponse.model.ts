import { Schema, model, Document, Types } from "mongoose";

export interface IExpertResponse extends Document {
  _id: Types.ObjectId;
  case: Types.ObjectId;
  expert: Types.ObjectId;
  message: string;
  recommendation?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const expertResponseSchema = new Schema<IExpertResponse>(
  {
    case: { type: Schema.Types.ObjectId, ref: "ExpertCase", required: true, index: true },
    expert: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 2000 },
    recommendation: { type: String, maxlength: 2000 },
    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

expertResponseSchema.index({ case: 1, createdAt: 1 });

export const ExpertResponse = model<IExpertResponse>("ExpertResponse", expertResponseSchema);
