"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import * as authApi from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

/** Hydrates the auth store from the session cookie via GET /api/auth/me. */
export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const { user } = await authApi.getMe();
        return user;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.data !== undefined) setUser(query.data);
  }, [query.data, setUser]);

  return query;
}

export function useLogout() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return async () => {
    await authApi.logout();
    setUser(null);
    queryClient.clear();
  };
}
