"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as diseasesApi from "@/lib/api/diseases";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

function riskTone(level: string): "success" | "warning" | "danger" {
  if (level === "high") return "danger";
  if (level === "medium") return "warning";
  return "success";
}

export function DiseaseRiskCard({ farmId, hasCycle }: { farmId: string; hasCycle: boolean }) {
  const t = useTranslations("dashboard");
  const tSeverity = useTranslations("severity");
  const { data, isLoading } = useQuery({
    queryKey: ["disease-risk", "latest", farmId],
    queryFn: () => diseasesApi.getLatestRisk(farmId),
    enabled: hasCycle,
  });

  return (
    <Card>
      <CardTitle>{t("diseaseRisk")}</CardTitle>
      {!hasCycle && <p className="mt-2 text-sm text-foreground/60">{t("noCropCycle")}</p>}
      {hasCycle && isLoading && <Spinner className="mt-3 text-primary" />}
      {hasCycle && data && !data.risk && <p className="mt-2 text-sm text-foreground/60">{t("noRiskAssessment")}</p>}
      {data?.risk && (
        <div className="mt-3">
          <Badge tone={riskTone(data.risk.riskLevel)}>{tSeverity(data.risk.riskLevel)}</Badge>
          <p className="mt-2 text-sm text-foreground/70">{data.risk.reason}</p>
        </div>
      )}
    </Card>
  );
}
