import { KnowledgeDocument, IKnowledgeDocument } from "../models/KnowledgeDocument.model";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { requestIngestDocument, requestDeleteEmbeddings } from "./aiClient.service";
import { enqueueKnowledgeIngestion } from "../queues";
import { CreateKnowledgeDocumentInput } from "../validators/knowledge.validator";

/**
 * Ingestion (chunking + embedding, delegated to the AI service) can take
 * up to a minute for a long document — per spec §8 ("Use BullMQ for: ...
 * Heavy AI jobs"), it runs in the background worker (see
 * ../workers/knowledgeIngestion.worker.ts) instead of blocking the
 * admin's POST request. The document is created with its model-default
 * "pending" status and enqueued here; the worker moves it through
 * "processing" to "ready"/"failed".
 */
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
    uploadedBy,
  });

  await enqueueKnowledgeIngestion(doc._id.toString());

  return doc;
}

export async function processIngestion(documentId: string): Promise<void> {
  const doc = await KnowledgeDocument.findById(documentId);
  if (!doc) {
    logger.warn("Knowledge ingestion job: document no longer exists, skipping", { documentId });
    return;
  }

  doc.status = "processing";
  await doc.save();

  const ingestResult = await requestIngestDocument({
    documentId: doc._id.toString(),
    title: doc.title,
    category: doc.category,
    language: doc.language,
    text: doc.rawText ?? "",
  });

  if (!ingestResult.ok) {
    logger.warn("Knowledge document ingestion failed", { documentId, reason: ingestResult.reason });
    doc.status = "failed";
    await doc.save();
    return;
  }

  doc.status = "ready";
  doc.chunkCount = ingestResult.data.chunkCount;
  await doc.save();
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
