import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User.model";
import { ApiError } from "../utils/ApiError";
import { signAccessToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/auth.validator";

const SALT_ROUNDS = 12;

export async function registerFarmer(input: RegisterInput): Promise<{ user: IUser; token: string }> {
  const existing = await User.findOne({
    $or: [
      ...(input.email ? [{ email: input.email }] : []),
      ...(input.phone ? [{ phone: input.phone }] : []),
    ],
  });

  if (existing) {
    throw ApiError.conflict("An account with this email or phone already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: "farmer",
    preferredLanguage: input.preferredLanguage,
    farmingExperienceYears: input.farmingExperienceYears,
    location: input.location
      ? { type: "Point", coordinates: [input.location.longitude, input.location.latitude] }
      : undefined,
  });

  const token = signAccessToken({ sub: user._id.toString(), role: user.role });

  return { user, token };
}

export async function login(input: LoginInput): Promise<{ user: IUser; token: string }> {
  const user = await User.findOne({
    $or: [{ email: input.identifier }, { phone: input.identifier }],
  }).select("+passwordHash");

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken({ sub: user._id.toString(), role: user.role });

  return { user, token };
}

export async function getUserById(id: string): Promise<IUser> {
  const user = await User.findById(id);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User not found or inactive");
  }
  return user;
}
