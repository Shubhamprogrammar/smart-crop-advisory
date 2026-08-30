import { IUser } from "../models/User.model";
import { fromGeoPoint } from "./geo";

export function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    location: fromGeoPoint(user.location),
    farmingExperienceYears: user.farmingExperienceYears,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}
