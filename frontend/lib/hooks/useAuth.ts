"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import * as authApi from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/apiClient";
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
      } catch (err) {
        // A confirmed 401 means genuinely logged out. Any other failure
        // (network hiccup, timeout, 5xx) is inconclusive -- rethrow so
        // query.data stays undefined instead of clobbering an
        // already-authenticated store (e.g. right after login).
        if (err instanceof ApiRequestError && err.status === 401) return null;
        throw err;
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
