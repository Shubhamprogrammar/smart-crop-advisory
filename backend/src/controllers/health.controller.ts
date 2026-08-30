import { Request, Response } from "express";
import mongoose from "mongoose";
import { sendSuccess } from "../utils/apiResponse";
import { redis } from "../config/redis";

const READY_STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export function getHealth(_req: Request, res: Response) {
  return sendSuccess(res, {
    message: "Backend service is healthy",
    data: {
      service: "smart-crop-advisory-backend",
      status: "ok",
      database: READY_STATES[mongoose.connection.readyState] ?? "unknown",
      redis: redis.status,
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    },
  });
}
