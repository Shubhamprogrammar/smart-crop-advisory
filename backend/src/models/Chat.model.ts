import { Schema, model, Document, Types } from "mongoose";
import { LANGUAGES, Language } from "../constants/enums";

export interface IChat extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  farm?: Types.ObjectId;
  title?: string;
  language: Language;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    farm: { type: Schema.Types.ObjectId, ref: "Farm" },
    title: { type: String, maxlength: 150 },
    language: { type: String, enum: LANGUAGES, default: "en" },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

chatSchema.index({ user: 1, updatedAt: -1 });

export const Chat = model<IChat>("Chat", chatSchema);
