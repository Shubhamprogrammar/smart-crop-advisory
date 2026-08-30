"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import * as authApi from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function ExpertHeader() {
  const t = useTranslations("expert");
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      router.push("/login");
    },
  });

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-4 py-3">
      <Link href="/expert" className="text-lg font-semibold text-primary">
        🌾 {t("title")}
      </Link>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="min-h-11 rounded-card border border-border px-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
        >
          {t("logout")}
        </button>
      </div>
    </header>
  );
}
