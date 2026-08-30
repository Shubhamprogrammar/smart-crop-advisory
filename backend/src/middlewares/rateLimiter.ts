import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";

/**
 * Redis-backed (per spec §8: "Use Redis for: ... Rate limiting"), so the
 * limit is shared across process restarts and multiple API instances
 * instead of resetting whenever the process restarts, as an in-memory
 * store would. `passOnStoreError: true` means a Redis outage fails open
 * (requests are allowed through, logged, not blocked) rather than
 * breaking the app for everyone — consistent with every other Redis
 * integration in this codebase (weather/market caching) degrading
 * gracefully instead of hard-failing (spec §18).
 */
function makeStore(prefix: string) {
  return new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as Promise<never>,
    prefix,
  });
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: makeStore("rl:auth:"),
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

/**
 * Guards endpoints that trigger an external AI-service call or an image
 * upload (spec §9's general "Rate limiting" plus the practical concern
 * that these are the most expensive, most abusable routes: disease
 * detection, crop recommendation, chat, soil OCR, knowledge ingestion).
 * Scoped per authenticated user (falls back to IP for the rare
 * unauthenticated case) rather than per IP alone, so one farmer on a
 * shared/NATed connection can't be rate-limited by another's usage.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: makeStore("rl:ai:"),
  keyGenerator: (req) => req.user?.id ?? req.ip ?? "unknown",
  message: {
    success: false,
    message: "Too many requests to this feature. Please slow down and try again shortly.",
  },
});

/**
 * A generous baseline over every /api route (app.ts) as defense-in-depth
 * against basic scripted abuse — the specific limiters above are the
 * real protection for the expensive endpoints; this just stops a single
 * client from hammering the API arbitrarily.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: makeStore("rl:global:"),
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
