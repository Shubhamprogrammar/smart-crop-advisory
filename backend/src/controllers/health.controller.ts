import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";

export function getHealth(_req: Request, res: Response) {
  return sendSuccess(res, {
    message: "Backend service is healthy",
    data: {
      service: "smart-crop-advisory-backend",
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    },
  });
}
