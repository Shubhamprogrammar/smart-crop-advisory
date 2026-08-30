import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../constants/enums";

export interface JwtPayload {
  sub: string;
  role: Role;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export const AUTH_COOKIE_NAME = "scas_token";
