import { Worker, Job } from "bullmq";
import { queueConnection } from "../config/queueConnection";
import { logger } from "../utils/logger";
import { QUEUE_NAMES } from "../queues/queueNames";
import { processIngestion } from "../services/knowledge.service";

export function startKnowledgeIngestionWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAMES.knowledgeIngestion,
    async (job: Job<{ documentId: string }>) => {
      await processIngestion(job.data.documentId);
    },
    { connection: queueConnection, concurrency: 2 }
  );

  worker.on("failed", (job, err) => {
    logger.warn("Knowledge ingestion job failed", { jobId: job?.id, documentId: job?.data?.documentId, err: err.message });
  });

  return worker;
}
