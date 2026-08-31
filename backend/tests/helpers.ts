import mongoose from "mongoose";
import request, { Agent, Response } from "supertest";
import app from "../src/app";
import { User } from "../src/models/User.model";
import { Farm } from "../src/models/Farm.model";

export const TEST_DB_NAME = "smart_crop_test";

/**
 * Connects to the test MongoDB before a suite runs and wipes it clean so
 * each suite starts from a predictable empty state. Called in beforeAll.
 */
export async function connectTestDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || `mongodb://127.0.0.1:27017/${TEST_DB_NAME}`);
  }
}

export async function closeTestDB(): Promise<void> {
  await mongoose.connection.db?.dropDatabase();
  await mongoose.disconnect();
  // Quietly release the BullMQ queue connection and cache Redis client so
  // Jest doesn't hang on open handles at the end of a suite.
  try {
    const { queueConnection } = require("../src/config/queueConnection");
    queueConnection.disconnect();
  } catch {
    /* noop */
  }
  try {
    const { redis } = require("../src/config/redis");
    redis.disconnect();
  } catch {
    /* noop */
  }
}

export async function clearDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    const collections = await mongoose.connection.db?.collections() ?? [];
    await Promise.all(collections.map((c) => c.deleteMany({})));
  }
}

export interface TestUser {
  token: string;
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface TestFarmer extends TestUser {
  farmId?: string;
}

export const FARMER_DEFAULTS = {
  name: "Test Farmer",
  email: "farmer@example.com",
  password: "Password123!",
  phone: "9876543210",
};

export const ADMIN_DEFAULTS = {
  name: "Test Admin",
  email: "admin@example.com",
  password: "Password123!",
  phone: "9876543211",
};

export const EXPERT_DEFAULTS = {
  name: "Test Expert",
  email: "expert@example.com",
  password: "Password123!",
  phone: "9876543212",
};

export const VALID_LOCATION = { latitude: 18.52, longitude: 73.86 };

/**
 * Registers a farmer through the real auth endpoint and returns their
 * token and profile.
 */
export async function registerFarmer(
  overrides: Partial<typeof FARMER_DEFAULTS> = {}
): Promise<TestFarmer> {
  const body = { ...FARMER_DEFAULTS, ...overrides };
  const res = await request(app).post("/api/auth/register").send(body);
  if (res.status !== 201) {
    throw new Error(`registerFarmer failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return {
    token: res.body.data.token as string,
    id: res.body.data.user.id as string,
    name: body.name,
    email: body.email,
    password: body.password,
  };
}

export async function createFarm(
  token: string,
  overrides: Record<string, unknown> = {}
): Promise<string> {
  const body = {
    name: "Green Valley Farm",
    landAreaAcres: 5,
    location: VALID_LOCATION,
    soilType: "loam",
    irrigationType: "drip",
    ...overrides,
  };
  const res = await request(app)
    .post("/api/farms")
    .set("Authorization", `Bearer ${token}`)
    .send(body);
  if (res.status !== 201) {
    throw new Error(`createFarm failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.farm.id as string;
}

/** Authenticated agent (attaches JWT cookie) for crisp, repeated calls. */
export function authedAgent(token: string): Agent {
  return request.agent(app).set("Authorization", `Bearer ${token}`);
}

export function expectUnauthorized(res: Response): void {
  expect(res.status).toBe(401);
}

export function expectForbidden(res: Response): void {
  expect(res.status).toBe(403);
}

export function expectUnprocessable(res: Response): void {
  expect(res.status).toBe(400);
}

/** Promote a user to a given role directly in the DB (for admin tests). */
export async function setUserRole(userId: string, role: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { role });
}

/**
 * Registers + promotes a user to a role and returns a freshly issued token
 * (tokens carry the role claim, so we must log in again after promotion).
 */
export async function registerAndUpgrade(
  role: "admin" | "expert",
  overrides: Partial<typeof FARMER_DEFAULTS> = {}
): Promise<TestUser> {
  const farmer = await registerFarmer(overrides);
  await setUserRole(farmer.id, role);
  const login = await request(app).post("/api/auth/login").send({
    identifier: overrides.email ?? FARMER_DEFAULTS.email,
    password: overrides.password ?? FARMER_DEFAULTS.password,
  });
  return {
    token: login.body.data.token as string,
    id: farmer.id,
    name: farmer.name,
    email: farmer.email,
    password: farmer.password,
  };
}

/** Seed the crops catalog used by market/advisory/crop tests. Idempotent. */
export async function seedCrops(): Promise<void> {
  const { Crop } = require("../src/models/Crop.model");
  const cropNames = ["tomato", "potato", "wheat", "rice", "maize"];
  const catalog = [
    { name: "tomato", category: "vegetable", seasons: ["kharif", "rabi", "zaid"], growthDurationDays: 90, diseaseDetectionSupported: true },
    { name: "potato", category: "vegetable", seasons: ["rabi"], growthDurationDays: 100, diseaseDetectionSupported: true },
    { name: "wheat", category: "cereal", seasons: ["rabi"], growthDurationDays: 120, diseaseDetectionSupported: true },
    { name: "rice", category: "cereal", seasons: ["kharif"], growthDurationDays: 120 },
    { name: "maize", category: "cereal", seasons: ["kharif", "rabi"], growthDurationDays: 100 },
  ];
  await Crop.deleteMany({ name: { $in: cropNames } });
  await Crop.insertMany(catalog);
}

export { request, app, User, Farm, mongoose };
