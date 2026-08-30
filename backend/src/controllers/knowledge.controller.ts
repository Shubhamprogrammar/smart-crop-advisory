import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeKnowledgeDocument } from "../utils/sanitizeKnowledgeDocument";
import * as knowledgeService from "../services/knowledge.service";
import { CreateKnowledgeDocumentInput } from "../validators/knowledge.validator";

export async function createDocument(req: Request, res: Response) {
  const input = req.body as CreateKnowledgeDocumentInput;
  const doc = await knowledgeService.createDocument(req.user!.id, input);
  return sendSuccess(res, {
    message: "Document queued for ingestion",
    data: { document: sanitizeKnowledgeDocument(doc) },
    statusCode: 201,
  });
}

export async function listDocuments(_req: Request, res: Response) {
  const docs = await knowledgeService.listDocuments();
  return sendSuccess(res, { message: "Documents fetched", data: { documents: docs.map(sanitizeKnowledgeDocument) } });
}

export async function deleteDocument(req: Request, res: Response) {
  await knowledgeService.deleteDocument(req.params.id);
  return sendSuccess(res, { message: "Document deleted" });
}
