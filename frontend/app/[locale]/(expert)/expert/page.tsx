"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import * as expertApi from "@/lib/api/expert";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge, priorityTone } from "@/components/ui/Badge";

export default function ExpertDashboardPage() {
  const t = useTranslations("expert");
  const tSeverity = useTranslations("severity");

  const { data: openData, isLoading: openLoading } = useQuery({
    queryKey: ["expert", "cases", "open"],
    queryFn: () => expertApi.listCases({ status: "open", limit: 5 }),
  });

  const { data: mineData, isLoading: mineLoading } = useQuery({
    queryKey: ["expert", "cases", "mine"],
    queryFn: () => expertApi.listCases({ assignedToMe: true, limit: 5 }),
  });

  const myActiveCount = mineData?.cases.filter((c) => c.status === "assigned" || c.status === "in_progress").length ?? 0;
  const myResolvedCount = mineData?.cases.filter((c) => c.status === "resolved" || c.status === "closed").length ?? 0;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <h1 className="text-xl font-semibold text-foreground">{t("dashboard")}</h1>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">{openData?.total ?? "—"}</p>
          <p className="mt-1 text-xs text-foreground/60">{t("openCases")}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">{myActiveCount}</p>
          <p className="mt-1 text-xs text-foreground/60">{t("myActiveCases")}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">{myResolvedCount}</p>
          <p className="mt-1 text-xs text-foreground/60">{t("resolved")}</p>
        </Card>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle>{t("openCases")}</CardTitle>
          <Link href="/expert/cases" className="text-xs font-medium text-primary">
            {t("viewAll")}
          </Link>
        </div>
        {openLoading && <Spinner className="text-primary" />}
        {openData?.cases.length === 0 && (
          <Card>
            <p className="text-sm text-foreground/50">{t("noOpenCases")}</p>
          </Card>
        )}
        <div className="flex flex-col gap-2">
          {openData?.cases.map((c) => (
            <Link key={c.id} href={`/expert/cases/${c.id}`}>
              <Card>
                <div className="flex items-center gap-2">
                  <Badge tone={priorityTone(c.priority)}>{tSeverity(c.priority)}</Badge>
                  <p className="font-medium text-foreground">{c.subject}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{c.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle>{t("myCases")}</CardTitle>
          <Link href="/expert/cases?assignedToMe=true" className="text-xs font-medium text-primary">
            {t("viewAll")}
          </Link>
        </div>
        {mineLoading && <Spinner className="text-primary" />}
        {mineData?.cases.length === 0 && (
          <Card>
            <p className="text-sm text-foreground/50">{t("noAssignedCases")}</p>
          </Card>
        )}
        <div className="flex flex-col gap-2">
          {mineData?.cases.map((c) => (
            <Link key={c.id} href={`/expert/cases/${c.id}`}>
              <Card>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={priorityTone(c.priority)}>{tSeverity(c.priority)}</Badge>
                    <p className="font-medium text-foreground">{c.subject}</p>
                  </div>
                  <Badge tone="neutral">{c.status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
