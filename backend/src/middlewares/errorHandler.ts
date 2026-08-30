import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { sendError } from "../utils/apiResponse";
import { env } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { stack: err.stack, details: err.details });
    }
    return sendError(res, {
      message: err.message,
      error: env.NODE_ENV === "production" ? undefined : err.details,
      statusCode: err.statusCode,
    });
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  logger.error(message, { err });

  return sendError(res, {
    message: env.NODE_ENV === "production" ? "Something went wrong" : message,
    statusCode: 500,
  });
}
