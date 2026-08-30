import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export function objectIdParamSchema(paramName: string) {
  return z.object({
    [paramName]: z.string().regex(objectIdRegex, `Invalid ${paramName}`),
  });
}
