"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import * as marketApi from "@/lib/api/market";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function MarketPriceCard({ cropName }: { cropName: string | null }) {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useQuery({
    queryKey: ["market", "price", cropName],
    queryFn: () => marketApi.getCurrentPrice(cropName!),
    enabled: !!cropName,
  });

  if (!cropName) {
    return (
      <Card>
        <CardTitle>{t("marketPrice")}</CardTitle>
        <p className="mt-2 text-sm text-foreground/60">{t("noCropCycle")}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{t("marketPrice")}</CardTitle>
        <Link href="/market" className="text-xs font-medium text-primary">
          {t("viewMore")}
        </Link>
      </div>
      {isLoading && <Spinner className="mt-3 text-primary" />}
      {data && (
        <div className="mt-3">
          <p className="text-2xl font-semibold text-foreground">
            ₹{data.modalPrice.toLocaleString()}{" "}
            <span className="text-sm font-normal text-foreground/60">/{data.unit}</span>
          </p>
          <p className="mt-1 text-xs text-warning">⚠ {t("simulatedData")}</p>
        </div>
      )}
    </Card>
  );
}
