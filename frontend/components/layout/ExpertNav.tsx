"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { DashboardIcon, CaseIcon, ProfileIcon } from "./icons";

const ITEMS = [
  { href: "/expert", labelKey: "dashboard", Icon: DashboardIcon },
  { href: "/expert/cases", labelKey: "cases", Icon: CaseIcon },
  { href: "/expert/profile", labelKey: "profile", Icon: ProfileIcon },
] as const;

export function ExpertNav() {
  const t = useTranslations("expert");
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-border bg-white">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {ITEMS.map(({ href, labelKey, Icon }) => {
          const active = href === "/expert" ? pathname === href : pathname.startsWith(href);
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
