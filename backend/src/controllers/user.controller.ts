import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { sanitizeUser } from "../utils/sanitizeUser";
import * as userService from "../services/user.service";
import * as authService from "../services/auth.service";
import { UpdateProfileInput } from "../validators/user.validator";

export async function getMyProfile(req: Request, res: Response) {
  const user = await authService.getUserById(req.user!.id);
  return sendSuccess(res, { message: "Profile fetched", data: { user: sanitizeUser(user) } });
}

export async function updateMyProfile(req: Request, res: Response) {
  const input = req.body as UpdateProfileInput;
  const user = await userService.updateProfile(req.user!.id, input);
  return sendSuccess(res, { message: "Profile updated", data: { user: sanitizeUser(user) } });
}
