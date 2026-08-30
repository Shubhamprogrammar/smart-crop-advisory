import { Request, Response } from "express";
import { env } from "../config/env";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeUser } from "../utils/sanitizeUser";
import { AUTH_COOKIE_NAME } from "../utils/jwt";
import * as authService from "../services/auth.service";
import { LoginInput, RegisterInput } from "../validators/auth.validator";

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // matches default JWT_EXPIRES_IN=7d

function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

export async function register(req: Request, res: Response) {
  const input = req.body as RegisterInput;
  const { user, token } = await authService.registerFarmer(input);

  setAuthCookie(res, token);

  return sendSuccess(res, {
    message: "Registration successful",
    data: { user: sanitizeUser(user), token },
    statusCode: 201,
  });
}

export async function login(req: Request, res: Response) {
  const input = req.body as LoginInput;
  const { user, token } = await authService.login(input);

  setAuthCookie(res, token);

  return sendSuccess(res, {
    message: "Login successful",
    data: { user: sanitizeUser(user), token },
  });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME);
  return sendSuccess(res, { message: "Logged out successfully" });
}

export async function getMe(req: Request, res: Response) {
  const user = await authService.getUserById(req.user!.id);
  return sendSuccess(res, {
    message: "Current user",
    data: { user: sanitizeUser(user) },
  });
}
