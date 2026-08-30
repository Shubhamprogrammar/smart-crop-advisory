"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as irrigationApi from "@/lib/api/irrigation";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

function urgencyTone(urgency: string): "success" | "warning" | "danger" | "info" {
  if (urgency === "high") return "danger";
  if (urgency === "medium") return "warning";
  if (urgency === "low") return "info";
  return "success";
}

export function IrrigationCard({ farmId, hasCycle }: { farmId: string; hasCycle: boolean }) {
  const t = useTranslations("dashboard");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["irrigation", farmId],
    queryFn: () => irrigationApi.getIrrigationRecommendation(farmId),
    enabled: hasCycle,
  });

  return (
    <Card>
      <CardTitle>{t("irrigation")}</CardTitle>
      {!hasCycle && <p className="mt-2 text-sm text-foreground/60">{t("noCropCycle")}</p>}
      {hasCycle && isLoading && <Spinner className="mt-3 text-primary" />}
      {hasCycle && isError && <p className="mt-2 text-sm text-foreground/60">{t("irrigationUnavailable")}</p>}
      {data && (
        <div className="mt-3">
          <Badge tone={urgencyTone(data.urgency)}>
            {data.irrigationRequired ? t("irrigationNeeded") : t("irrigationNotNeeded")}
          </Badge>
          <p className="mt-2 text-sm text-foreground/70">{data.reason}</p>
        </div>
      )}
    </Card>
  );
}
