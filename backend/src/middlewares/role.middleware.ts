import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { Role } from "../constants/enums";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(ApiError.unauthorized("Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden("You do not have permission to perform this action"));
      return;
    }

    next();
  };
}
