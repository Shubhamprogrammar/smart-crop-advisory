"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import * as notificationsApi from "@/lib/api/notifications";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BellIcon } from "./icons";

export function Header() {
  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60_000,
  });

  const count = data?.count ?? 0;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-4 py-3">
      <Link href="/dashboard" className="text-lg font-semibold text-primary">
        🌾 Smart Crop Advisory
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/notifications" className="relative flex min-h-11 min-w-11 items-center justify-center">
          <BellIcon width={22} height={22} className="text-foreground/70" />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
