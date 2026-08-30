import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

type RequestPart = "body" | "query" | "params";

export function validate(schema: ZodType, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      next(ApiError.badRequest("Validation failed", result.error.flatten().fieldErrors));
      return;
    }

    req[part] = result.data;
    next();
  };
}
