import { apiClient, unwrap } from "@/lib/apiClient";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "farmer" | "expert" | "admin";
  preferredLanguage: "en" | "hi" | "mr" | "gu";
  location?: { latitude: number; longitude: number };
  farmingExperienceYears?: number;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface RegisterInput {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  preferredLanguage?: User["preferredLanguage"];
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<{ user: User; token: string }> {
  return unwrap(apiClient.post("/api/auth/register", input));
}

export async function login(input: LoginInput): Promise<{ user: User; token: string }> {
  return unwrap(apiClient.post("/api/auth/login", input));
}

export async function logout(): Promise<void> {
  await unwrap(apiClient.post("/api/auth/logout"));
}

export async function getMe(): Promise<{ user: User }> {
  return unwrap(apiClient.get("/api/auth/me"));
}

export async function updateProfile(input: Partial<{
  name: string;
  preferredLanguage: User["preferredLanguage"];
  farmingExperienceYears: number;
  location: { latitude: number; longitude: number };
}>): Promise<{ user: User }> {
  return unwrap(apiClient.patch("/api/users/me", input));
}
