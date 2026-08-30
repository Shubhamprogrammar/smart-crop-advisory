import { apiClient, unwrap } from "@/lib/apiClient";

export const KNOWLEDGE_CATEGORIES = [
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
export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: KnowledgeCategory;
  sourceType: "pdf" | "manual" | "url";
  sourceUrl?: string;
  language: "en" | "hi" | "mr" | "gu";
  chunkCount?: number;
  status: "pending" | "ready" | "failed";
  createdAt: string;
}

export interface CreateKnowledgeDocumentInput {
  title: string;
  category: KnowledgeCategory;
  language?: KnowledgeDocument["language"];
  sourceType?: KnowledgeDocument["sourceType"];
  sourceUrl?: string;
  text: string;
}

export async function listDocuments(): Promise<{ documents: KnowledgeDocument[] }> {
  return unwrap(apiClient.get("/api/knowledge"));
}

export async function createDocument(
  input: CreateKnowledgeDocumentInput
): Promise<{ document: KnowledgeDocument }> {
  return unwrap(apiClient.post("/api/knowledge", input));
}

export async function deleteDocument(id: string): Promise<void> {
  await unwrap(apiClient.delete(`/api/knowledge/${id}`));
}
