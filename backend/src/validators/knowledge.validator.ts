import { z } from "zod";
import { LANGUAGES } from "../constants/enums";
import { KNOWLEDGE_CATEGORIES } from "../models/KnowledgeDocument.model";
import { objectIdParamSchema } from "./common.validator";

export const createKnowledgeDocumentSchema = z.object({
  title: z.string().trim().min(2).max(200),
  category: z.enum(KNOWLEDGE_CATEGORIES),
  language: z.enum(LANGUAGES).default("en"),
  sourceType: z.enum(["pdf", "manual", "url"]).default("manual"),
  sourceUrl: z.string().trim().url().optional(),
  text: z
    .string()
    .trim()
    .min(50, "Provide at least 50 characters of content to ingest")
    .max(50000, "Content must be 50,000 characters or fewer — split longer documents into multiple entries"),
});

export type CreateKnowledgeDocumentInput = z.infer<typeof createKnowledgeDocumentSchema>;

export const knowledgeDocumentIdParamSchema = objectIdParamSchema("id");
