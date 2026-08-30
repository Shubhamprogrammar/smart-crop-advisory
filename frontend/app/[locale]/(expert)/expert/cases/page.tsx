"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import * as expertApi from "@/lib/api/expert";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge, priorityTone } from "@/components/ui/Badge";

export default function ExpertCasesPage() {
  const t = useTranslations("expert");
  const tSeverity = useTranslations("severity");
  const searchParams = useSearchParams();

  const [status, setStatus] = useState("");
  const [assignedToMe, setAssignedToMe] = useState(searchParams.get("assignedToMe") === "true");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["expert", "cases", "list", status, assignedToMe, page],
    queryFn: () =>
      expertApi.listCases({
        status: (status || undefined) as expertApi.ExpertCase["status"] | undefined,
        assignedToMe: assignedToMe || undefined,
        page,
        limit: 20,
      }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <h1 className="text-xl font-semibold text-foreground">{t("cases")}</h1>

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
          <option value="open">{t("statusOpen")}</option>
          <option value="assigned">{t("statusAssigned")}</option>
          <option value="in_progress">{t("statusInProgress")}</option>
          <option value="resolved">{t("statusResolved")}</option>
          <option value="closed">{t("statusClosed")}</option>
        </select>
        <label className="flex min-h-11 items-center gap-2 text-sm text-foreground/70">
          <input
            type="checkbox"
            checked={assignedToMe}
            onChange={(e) => {
              setAssignedToMe(e.target.checked);
              setPage(1);
            }}
          />
          {t("onlyMine")}
        </label>
      </div>

      {isLoading && <Spinner className="text-primary" />}

      <div className="flex flex-col gap-2">
        {data?.cases.map((c) => (
          <Link key={c.id} href={`/expert/cases/${c.id}`}>
            <Card>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={priorityTone(c.priority)}>{tSeverity(c.priority)}</Badge>
                    <p className="font-medium text-foreground">{c.subject}</p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{c.description}</p>
                </div>
                <Badge tone="neutral">{c.status}</Badge>
              </div>
            </Card>
          </Link>
        ))}
        {data?.cases.length === 0 && (
          <Card>
            <p className="text-sm text-foreground/50">{t("noCases")}</p>
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
