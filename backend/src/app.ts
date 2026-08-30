import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import healthRoutes from "./routes/health.routes";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { globalApiLimiter } from "./middlewares/rateLimiter";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
// Defense-in-depth against NoSQL operator injection (spec §9 "Input
// sanitization") — strips any `$`-prefixed or `.`-containing key from
// req.body/query/params. The pervasive Zod validation elsewhere already
// rejects an injected operator object for any typed field (z.string()
// can't parse {"$gt": ""}), so this mainly guards routes/fields outside
// that coverage rather than being the primary defense.
app.use(mongoSanitize());
app.use(
  morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use("/health", healthRoutes);
app.use("/api", globalApiLimiter, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
