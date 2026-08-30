import { User, IUser } from "../models/User.model";
import { ApiError } from "../utils/ApiError";
import { toGeoPoint } from "../utils/geo";
import { UpdateProfileInput } from "../validators/user.validator";

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw ApiError.notFound("User not found");
  }

  if (input.name !== undefined) user.name = input.name;
  if (input.preferredLanguage !== undefined) user.preferredLanguage = input.preferredLanguage;
  if (input.farmingExperienceYears !== undefined) {
    user.farmingExperienceYears = input.farmingExperienceYears;
  }
  if (input.location !== undefined) user.location = toGeoPoint(input.location);

  await user.save();
  return user;
}
