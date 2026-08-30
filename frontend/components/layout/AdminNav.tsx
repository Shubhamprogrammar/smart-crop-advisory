"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const ITEMS = [
  { href: "/admin", labelKey: "dashboard" },
  { href: "/admin/users", labelKey: "users" },
  { href: "/admin/crops", labelKey: "crops" },
  { href: "/admin/advisories", labelKey: "advisories" },
  { href: "/admin/diseases", labelKey: "diseases" },
  { href: "/admin/knowledge", labelKey: "knowledge" },
  { href: "/admin/rules", labelKey: "rules" },
] as const;

export function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-white">
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4">
        {ITEMS.map(({ href, labelKey }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                className={`flex min-h-12 items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap ${
                  active ? "border-primary text-primary" : "border-transparent text-foreground/60 hover:text-foreground"
                }`}
              >
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
