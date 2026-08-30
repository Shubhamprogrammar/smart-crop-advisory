"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import * as adminApi from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

function riskTone(level?: string): "success" | "warning" | "danger" | "neutral" {
  if (level === "high") return "danger";
  if (level === "medium") return "warning";
  if (level === "low") return "success";
  return "neutral";
}

export default function AdminDiseasesPage() {
  const t = useTranslations("admin");
  const tSeverity = useTranslations("severity");
  const [severity, setSeverity] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "diseases", severity, page],
    queryFn: () => adminApi.listDiseaseDetections({ severity: (severity || undefined) as "low" | "medium" | "high" | undefined, page, limit: 20 }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <h1 className="text-xl font-semibold text-foreground">{t("diseases")}</h1>

      <select
        value={severity}
        onChange={(e) => {
          setSeverity(e.target.value);
          setPage(1);
        }}
        className="min-h-11 w-fit rounded-card border border-border bg-white px-3 text-sm"
      >
        <option value="">{t("allSeverities")}</option>
        <option value="low">{tSeverity("low")}</option>
        <option value="medium">{tSeverity("medium")}</option>
        <option value="high">{tSeverity("high")}</option>
      </select>

      {isLoading && <Spinner className="text-primary" />}

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-foreground/60">
              <th className="px-4 py-3 font-medium">{t("cropType")}</th>
              <th className="px-4 py-3 font-medium">{t("predictedDisease")}</th>
              <th className="px-4 py-3 font-medium">{t("severity")}</th>
              <th className="px-4 py-3 font-medium">{t("farmer")}</th>
              <th className="px-4 py-3 font-medium">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.detections.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 capitalize text-foreground">{d.cropType}</td>
                <td className="px-4 py-3 text-foreground/70">{d.predictedDisease ?? "—"}</td>
                <td className="px-4 py-3">
                  {d.severity ? <Badge tone={riskTone(d.severity)}>{tSeverity(d.severity)}</Badge> : "—"}
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  {typeof d.farmer === "object" ? d.farmer.name : d.farmer}
                </td>
                <td className="px-4 py-3">
                  <Badge tone="neutral">{d.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.detections.length === 0 && <p className="p-4 text-sm text-foreground/50">{t("noData")}</p>}
      </Card>

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-foreground/60">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">
            ← {t("previous")}
          </button>
          <span>
            {t("page")} {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40">
            {t("next")} →
          </button>
        </div>
      )}
    </div>
  );
}
