import { create } from "zustand";
import { User } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  setUser: (user: User | null) => void;
  setStatus: (status: AuthState["status"]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  setUser: (user) => set({ user, status: user ? "authenticated" : "unauthenticated" }),
  setStatus: (status) => set({ status }),
}));
