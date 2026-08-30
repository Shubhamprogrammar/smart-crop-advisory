import { IKnowledgeDocument } from "../models/KnowledgeDocument.model";

export function sanitizeKnowledgeDocument(doc: IKnowledgeDocument) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    category: doc.category,
    sourceType: doc.sourceType,
    sourceUrl: doc.sourceUrl,
    language: doc.language,
    chunkCount: doc.chunkCount,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
