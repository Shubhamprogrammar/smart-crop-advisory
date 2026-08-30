"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as adminApi from "@/lib/api/admin";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-foreground">{value.toLocaleString()}</p>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.getStats(),
  });

  if (isLoading) return <Spinner className="text-primary" />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <h1 className="text-xl font-semibold text-foreground">{t("dashboard")}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label={t("totalFarmers")} value={data.totalFarmers} />
        <StatCard label={t("totalFarms")} value={data.totalFarms} />
        <StatCard label={t("activeCrops")} value={data.activeCrops} />
        <StatCard label={t("diseaseDetections")} value={data.diseaseDetections} />
        <StatCard label={t("activeAdvisories")} value={data.activeAdvisories} />
        <StatCard label={t("highRiskFarms")} value={data.highRiskFarms} />
        <StatCard label={t("newUsers7d")} value={data.userActivity.newUsersLast7Days} />
        <StatCard label={t("activeUsers7d")} value={data.userActivity.activeUsersLast7Days} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>{t("cropDistribution")}</CardTitle>
          {data.cropDistribution.length === 0 && <p className="mt-2 text-sm text-foreground/50">{t("noData")}</p>}
          <ul className="mt-3 flex flex-col gap-2">
            {data.cropDistribution.map((c) => (
              <li key={c.crop} className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground/80">{c.crop}</span>
                <span className="font-medium text-foreground">{c.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>{t("diseaseDistribution")}</CardTitle>
          {data.diseaseDistribution.length === 0 && <p className="mt-2 text-sm text-foreground/50">{t("noData")}</p>}
          <ul className="mt-3 flex flex-col gap-2">
            {data.diseaseDistribution.map((d) => (
              <li key={d.disease} className="flex items-center justify-between text-sm">
                <span className="text-foreground/80">{d.disease}</span>
                <span className="font-medium text-foreground">{d.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>{t("regionalRisk")}</CardTitle>
          {data.regionalRisk.length === 0 && <p className="mt-2 text-sm text-foreground/50">{t("noData")}</p>}
          <ul className="mt-3 flex flex-col gap-2">
            {data.regionalRisk.map((r) => (
              <li key={`${r.lat},${r.lng}`} className="flex items-center justify-between text-sm">
                <span className="text-foreground/80">
                  {r.lat.toFixed(1)}, {r.lng.toFixed(1)}
                </span>
                <span className="flex gap-2">
                  {r.high > 0 && <Badge tone="danger">{r.high} {t("high")}</Badge>}
                  {r.medium > 0 && <Badge tone="warning">{r.medium} {t("medium")}</Badge>}
                  {r.low > 0 && <Badge tone="success">{r.low} {t("low")}</Badge>}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>{t("marketTrends")}</CardTitle>
          {data.marketTrends.length === 0 && <p className="mt-2 text-sm text-foreground/50">{t("noData")}</p>}
          <ul className="mt-3 flex flex-col gap-2">
            {data.marketTrends.map((m) => (
              <li key={m.crop} className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground/80">{m.crop}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-foreground">₹{m.modalPrice.toLocaleString()}</span>
                  <Badge tone={m.direction === "rising" ? "success" : m.direction === "falling" ? "danger" : "info"}>
                    {m.direction}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
          {data.marketTrends.some((m) => m.isSimulated) && (
            <p className="mt-3 text-xs text-warning">⚠ {t("simulatedDataNote")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
