import { Schema, model, Document, Types } from "mongoose";
import { LANGUAGES, Language } from "../constants/enums";

const KNOWLEDGE_CATEGORIES = [
  "crop_cultivation",
  "disease_management",
  "fertilizer",
  "irrigation",
  "pest_management",
  "soil_management",
  "crop_calendar",
  "government_scheme",
  "best_practices",
] as const;

export interface IKnowledgeDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  category: (typeof KNOWLEDGE_CATEGORIES)[number];
  sourceType: "pdf" | "manual" | "url";
  sourceUrl?: string;
  language: Language;
  rawText?: string;
  chunkCount: number;
  status: "pending" | "processing" | "ready" | "failed";
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeDocumentSchema = new Schema<IKnowledgeDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, enum: KNOWLEDGE_CATEGORIES, required: true, index: true },
    sourceType: { type: String, enum: ["pdf", "manual", "url"], required: true },
    sourceUrl: { type: String },
    language: { type: String, enum: LANGUAGES, default: "en" },
    rawText: { type: String },
    chunkCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Chunk-level text + embeddings are introduced in Phase 12 (RAG) as their own
// collection so each chunk can carry its own Atlas Vector Search index.

export const KnowledgeDocument = model<IKnowledgeDocument>(
  "KnowledgeDocument",
  knowledgeDocumentSchema
);
