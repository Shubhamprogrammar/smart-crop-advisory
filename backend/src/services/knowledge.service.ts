import { KnowledgeDocument, IKnowledgeDocument } from "../models/KnowledgeDocument.model";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { requestIngestDocument, requestDeleteEmbeddings } from "./aiClient.service";
import { CreateKnowledgeDocumentInput } from "../validators/knowledge.validator";

export async function createDocument(
  uploadedBy: string,
  input: CreateKnowledgeDocumentInput
): Promise<IKnowledgeDocument> {
  const doc = await KnowledgeDocument.create({
    title: input.title,
    category: input.category,
    language: input.language,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    rawText: input.text,
    status: "processing",
    uploadedBy,
  });

  const ingestResult = await requestIngestDocument({
    documentId: doc._id.toString(),
    title: input.title,
    category: input.category,
    language: input.language,
    text: input.text,
  });

  if (!ingestResult.ok) {
    logger.warn("Knowledge document ingestion failed", { documentId: doc._id.toString(), reason: ingestResult.reason });
    doc.status = "failed";
    await doc.save();
    return doc;
  }

  doc.status = "ready";
  doc.chunkCount = ingestResult.data.chunkCount;
  await doc.save();
  return doc;
}

export async function listDocuments(): Promise<IKnowledgeDocument[]> {
  return KnowledgeDocument.find().sort({ createdAt: -1 });
}

export async function deleteDocument(id: string): Promise<void> {
  const doc = await KnowledgeDocument.findById(id);
  if (!doc) {
    throw ApiError.notFound("Knowledge document not found");
  }

  const deleteResult = await requestDeleteEmbeddings(id);
  if (!deleteResult.ok) {
    logger.warn("Failed to delete embeddings for knowledge document; deleting Mongo record anyway", {
      documentId: id,
      reason: deleteResult.reason,
    });
  }

  await doc.deleteOne();
}
