"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import * as expertApi from "@/lib/api/expert";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge, priorityTone } from "@/components/ui/Badge";

export default function AskExpertCaseDetailPage() {
  const t = useTranslations("askExpert");
  const tSeverity = useTranslations("severity");
  const params = useParams<{ id: string }>();
  const caseId = params.id;

  const { data, isLoading } = useQuery({
    queryKey: ["ask-expert", "case", caseId],
    queryFn: () => expertApi.getCaseDetail(caseId),
  });

  if (isLoading) return <Spinner className="text-primary" />;
  if (!data) return null;

  const { case: c, responses } = data;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <div className="flex items-center gap-2">
          <Badge tone={priorityTone(c.priority)}>{tSeverity(c.priority)}</Badge>
          <Badge tone="neutral">{c.status}</Badge>
        </div>
        <h1 className="mt-2 text-xl font-semibold text-foreground">{c.subject}</h1>
        <p className="mt-1 text-sm text-foreground/70">{c.description}</p>
      </div>

      {c.status === "open" && (
        <Card>
          <p className="text-sm text-foreground/60">{t("waitingForExpert")}</p>
        </Card>
      )}

      <div>
        <CardTitle>{t("expertReplies")}</CardTitle>
        <div className="mt-2 flex flex-col gap-2">
          {responses.map((r) => (
            <Card key={r.id}>
              <p className="text-sm text-foreground">{r.message}</p>
              {r.recommendation && (
                <p className="mt-2 text-sm text-foreground/70">
                  <span className="font-medium">{t("recommendation")}:</span> {r.recommendation}
                </p>
              )}
            </Card>
          ))}
          {responses.length === 0 && c.status !== "open" && (
            <p className="text-sm text-foreground/50">{t("noRepliesYet")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
