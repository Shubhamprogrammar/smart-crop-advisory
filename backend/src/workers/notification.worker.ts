import { Worker, Job } from "bullmq";
import { queueConnection } from "../config/queueConnection";
import { logger } from "../utils/logger";
import { QUEUE_NAMES } from "../queues/queueNames";
import { createNotification, CreateNotificationInput } from "../services/notification.service";

export function startNotificationWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAMES.notifications,
    async (job: Job<CreateNotificationInput>) => {
      await createNotification(job.data);
    },
    { connection: queueConnection, concurrency: 5 }
  );

  worker.on("failed", (job, err) => {
    logger.warn("Notification job failed", { jobId: job?.id, err: err.message });
  });

  return worker;
}
