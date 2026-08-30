"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { DashboardIcon, FarmIcon, AssistantIcon, MarketIcon, ProfileIcon } from "./icons";

const ITEMS = [
  { href: "/dashboard", labelKey: "dashboard", Icon: DashboardIcon },
  { href: "/farms", labelKey: "myFarms", Icon: FarmIcon },
  { href: "/assistant", labelKey: "aiAssistant", Icon: AssistantIcon },
  { href: "/market", labelKey: "market", Icon: MarketIcon },
  { href: "/profile", labelKey: "profile", Icon: ProfileIcon },
] as const;

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-border bg-white">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {ITEMS.map(({ href, labelKey, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${
                  active ? "text-primary" : "text-foreground/50"
                }`}
              >
                <Icon width={22} height={22} />
                <span>{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
