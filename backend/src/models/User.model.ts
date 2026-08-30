import { Schema, model, Document, Types } from "mongoose";
import { ROLES, Role, LANGUAGES, Language } from "../constants/enums";
import { GeoPoint, geoPointSchema } from "./schemas/geoPoint.schema";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  preferredLanguage: Language;
  location?: GeoPoint;
  farmingExperienceYears?: number;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      match: [/^[0-9+\-\s]{7,15}$/, "Invalid phone number"],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "farmer", required: true, index: true },
    preferredLanguage: { type: String, enum: LANGUAGES, default: "en" },
    location: { type: geoPointSchema, required: false },
    farmingExperienceYears: { type: Number, min: 0, max: 100 },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("validate", function preValidate(next) {
  if (!this.email && !this.phone) {
    next(new Error("Either email or phone is required"));
    return;
  }
  next();
});

export const User = model<IUser>("User", userSchema);
