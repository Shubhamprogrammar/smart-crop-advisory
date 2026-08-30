"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/lib/hooks/useAuth";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ExpertProfilePage() {
  const t = useTranslations("expert");
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="text-xl font-semibold text-foreground">{t("profile")}</h1>

      <Card>
        <CardTitle>{user.name}</CardTitle>
        {user.phone && <p className="mt-1 text-sm text-foreground/60">📱 {user.phone}</p>}
        {user.email && <p className="mt-1 text-sm text-foreground/60">✉️ {user.email}</p>}
      </Card>

      <Card>
        <CardTitle>{t("language")}</CardTitle>
        <div className="mt-2">
          <LanguageSwitcher />
        </div>
      </Card>

      <Button variant="outline" onClick={logout}>
        {t("logout")}
      </Button>
    </div>
  );
}
