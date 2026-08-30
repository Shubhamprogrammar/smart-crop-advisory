"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/lib/apiClient";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
  const t = useTranslations("home");
  const { data, isLoading, isError } = useBackendHealth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="w-full max-w-md flex justify-end">
        <LanguageSwitcher />
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-white px-8 py-10 shadow-sm max-w-md w-full">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">🌾 {t("title")}</h1>
        <p className="mt-2 text-base text-[var(--foreground)]/70">{t("subtitle")}</p>

        <div className="mt-6 rounded-[var(--radius-card)] bg-[var(--muted)] px-4 py-3 text-sm">
          {isLoading && <span className="text-[var(--foreground)]/60">{t("backendChecking")}</span>}
          {isError && <span className="text-[var(--color-danger)]">{t("backendUnavailable")}</span>}
          {data?.success && (
            <span className="text-[var(--color-success)]">
              {t("backendConnected")} · {data.data.service} · {t("status")}: {data.data.status}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
