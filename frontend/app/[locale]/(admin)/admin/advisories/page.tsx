"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import * as adminApi from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge, priorityTone } from "@/components/ui/Badge";

export default function AdminAdvisoriesPage() {
  const t = useTranslations("admin");
  const tSeverity = useTranslations("severity");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "advisories", status, priority, page],
    queryFn: () => adminApi.listAdvisories({ status: status || undefined, priority: priority || undefined, page, limit: 20 }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <h1 className="text-xl font-semibold text-foreground">{t("advisories")}</h1>

      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="min-h-11 rounded-card border border-border bg-white px-3 text-sm"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="active">active</option>
          <option value="acknowledged">acknowledged</option>
          <option value="dismissed">dismissed</option>
          <option value="expired">expired</option>
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="min-h-11 rounded-card border border-border bg-white px-3 text-sm"
        >
          <option value="">{t("allPriorities")}</option>
          <option value="low">{tSeverity("low")}</option>
          <option value="medium">{tSeverity("medium")}</option>
          <option value="high">{tSeverity("high")}</option>
        </select>
      </div>

      {isLoading && <Spinner className="text-primary" />}

      <div className="flex flex-col gap-3">
        {data?.advisories.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={priorityTone(a.priority)}>{tSeverity(a.priority)}</Badge>
                  <p className="font-medium text-foreground">{a.title}</p>
                </div>
                <p className="mt-1 text-sm text-foreground/70">{a.reason}</p>
                <p className="mt-1 text-xs text-foreground/50">
                  {typeof a.farm === "object" ? a.farm.name : a.farm} ·{" "}
                  {typeof a.farmer === "object" ? a.farmer.name : a.farmer}
                </p>
              </div>
              <Badge tone="neutral">{a.status}</Badge>
            </div>
          </Card>
        ))}
        {data?.advisories.length === 0 && (
          <Card>
            <p className="text-sm text-foreground/50">{t("noData")}</p>
          </Card>
        )}
      </div>

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
