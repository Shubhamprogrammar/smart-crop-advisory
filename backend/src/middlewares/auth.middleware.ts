import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { AUTH_COOKIE_NAME, verifyAccessToken } from "../utils/jwt";

function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }

  return undefined;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    next(ApiError.unauthorized("Authentication required"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired session"));
  }
}
