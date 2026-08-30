import { Schema, model, Document, Types } from "mongoose";
import { LANGUAGES, Language } from "../constants/enums";

interface RagSource {
  documentId: Types.ObjectId;
  title: string;
  chunkText: string;
}

export interface IChatMessage extends Document {
  _id: Types.ObjectId;
  chat: Types.ObjectId;
  sender: "user" | "assistant";
  content: string;
  contextSnapshot?: Record<string, unknown>;
  ragSources?: RagSource[];
  language: Language;
  createdAt: Date;
  updatedAt: Date;
}

const ragSourceSchema = new Schema<RagSource>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "KnowledgeDocument", required: true },
    title: { type: String, required: true },
    chunkText: { type: String, required: true },
  },
  { _id: false }
);

const chatMessageSchema = new Schema<IChatMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
    sender: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 4000 },
    contextSnapshot: { type: Schema.Types.Mixed },
    ragSources: { type: [ragSourceSchema], default: [] },
    language: { type: String, enum: LANGUAGES, default: "en" },
  },
  { timestamps: true }
);

chatMessageSchema.index({ chat: 1, createdAt: 1 });

export const ChatMessage = model<IChatMessage>("ChatMessage", chatMessageSchema);
