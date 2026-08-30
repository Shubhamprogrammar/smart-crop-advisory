import { redis } from "../config/redis";
import { logger } from "./logger";

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redis.status !== "ready") return null;

  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    logger.warn("Cache read failed, continuing without cache", { key, err });
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (redis.status !== "ready") return;

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    logger.warn("Cache write failed, continuing without cache", { key, err });
  }
}
