import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";

/**
 * Redis-backed (per spec §8: "Use Redis for: ... Rate limiting"), so the
 * limit is shared across process restarts and multiple API instances
 * instead of resetting whenever the process restarts, as an in-memory
 * store would. `passOnStoreError: true` means a Redis outage fails open
 * (requests are allowed through, logged, not blocked) rather than
 * breaking login/register for everyone — consistent with every other
 * Redis integration in this codebase (weather/market caching) degrading
 * gracefully instead of hard-failing (spec §18).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as Promise<never>,
    prefix: "rl:auth:",
  }),
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});
