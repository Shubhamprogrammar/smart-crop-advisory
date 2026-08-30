"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as advisoriesApi from "@/lib/api/advisories";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge, priorityTone } from "@/components/ui/Badge";

export function AdvisoryCard({ farmId, hasCycle }: { farmId: string; hasCycle: boolean }) {
  const t = useTranslations("dashboard");
  const tSeverity = useTranslations("severity");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["advisories", "active", farmId],
    queryFn: () => advisoriesApi.listActiveAdvisories(farmId),
    enabled: hasCycle,
  });

  const generateMutation = useMutation({
    mutationFn: () => advisoriesApi.generateAdvisories(farmId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["advisories", "active", farmId] }),
  });

  const top = data?.advisories[0];

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{t("todaysAdvisory")}</CardTitle>
        {hasCycle && (
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="text-xs font-medium text-primary disabled:opacity-50"
          >
            {generateMutation.isPending ? "…" : t("refresh")}
          </button>
        )}
      </div>

      {!hasCycle && <p className="mt-2 text-sm text-foreground/60">{t("noCropCycle")}</p>}
      {hasCycle && isLoading && <Spinner className="mt-3 text-primary" />}
      {hasCycle && data && data.advisories.length === 0 && (
        <p className="mt-2 text-sm text-foreground/60">{t("noAdvisories")}</p>
      )}
      {top && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <Badge tone={priorityTone(top.priority)}>{tSeverity(top.priority)}</Badge>
            <p className="font-medium text-foreground">{top.title}</p>
          </div>
          <p className="mt-1 text-sm text-foreground/70">{top.action}</p>
        </div>
      )}
    </Card>
  );
}
