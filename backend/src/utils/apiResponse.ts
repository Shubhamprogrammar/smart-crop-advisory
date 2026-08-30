import { Response } from "express";

interface SuccessPayload<T> {
  message: string;
  data?: T;
  statusCode?: number;
}

interface ErrorPayload {
  message: string;
  error?: unknown;
  statusCode?: number;
}

export function sendSuccess<T>(res: Response, { message, data, statusCode = 200 }: SuccessPayload<T>) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
}

export function sendError(res: Response, { message, error, statusCode = 500 }: ErrorPayload) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ?? null,
  });
}
