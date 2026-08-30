"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as soilApi from "@/lib/api/soil";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

function scoreTone(score: number): "success" | "warning" | "danger" {
  if (score >= 65) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

export function SoilHealthCard({ farmId }: { farmId: string }) {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useQuery({
    queryKey: ["soil", "latest", farmId],
    queryFn: () => soilApi.getLatestSoilReport(farmId),
  });

  return (
    <Card>
      <CardTitle>{t("soilHealth")}</CardTitle>
      {isLoading && <Spinner className="mt-3 text-primary" />}
      {data && !data.report && <p className="mt-2 text-sm text-foreground/60">{t("noSoilReport")}</p>}
      {data?.report && (
        <div className="mt-3">
          {data.report.healthScore !== undefined ? (
            <div className="flex items-center gap-3">
              <p className="text-3xl font-semibold text-foreground">{data.report.healthScore}</p>
              <Badge tone={scoreTone(data.report.healthScore)}>
                {data.report.healthScore >= 65 ? t("healthy") : data.report.healthScore >= 40 ? t("fair") : t("poor")}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-foreground/60">{t("noSoilReport")}</p>
          )}
        </div>
      )}
    </Card>
  );
}
