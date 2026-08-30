"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/apiClient";

interface HealthData {
  service: string;
  status: string;
  timestamp: string;
  uptimeSeconds: number;
}

function useBackendHealth() {
  return useQuery({
    queryKey: ["backend-health"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<HealthData>>("/health");
      return data;
    },
  });
}

export default function Home() {
  const { data, isLoading, isError } = useBackendHealth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white px-8 py-10 shadow-sm max-w-md w-full">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          🌾 Smart Crop Advisory
        </h1>
        <p className="mt-2 text-base text-[var(--foreground)]/70">
          Architecture scaffold — Phase 0 complete.
        </p>

        <div className="mt-6 rounded-[var(--radius-card)] bg-[var(--muted)] px-4 py-3 text-sm">
          {isLoading && <span className="text-[var(--foreground)]/60">Checking backend connection…</span>}
          {isError && (
            <span className="text-[var(--color-danger)]">
              Backend unavailable — start the API on port 5000.
            </span>
          )}
          {data?.success && (
            <span className="text-[var(--color-success)]">
              Backend connected · {data.data.service} · status: {data.data.status}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
