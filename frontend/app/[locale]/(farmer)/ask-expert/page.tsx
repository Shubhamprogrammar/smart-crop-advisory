"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import * as expertApi from "@/lib/api/expert";
import { ApiRequestError } from "@/lib/apiClient";
import { useFarms } from "@/lib/hooks/useFarms";
import { useFarmStore } from "@/store/farmStore";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge, priorityTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AskExpertPage() {
  const t = useTranslations("askExpert");
  const tSeverity = useTranslations("severity");
  const queryClient = useQueryClient();
  const { data: farmsData } = useFarms();
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);

  const [showForm, setShowForm] = useState(false);
  const [farmId, setFarmId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["ask-expert", "cases"],
    queryFn: () => expertApi.listCases({}),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      expertApi.createCase({
        farmId: farmId || selectedFarmId || farmsData?.farms[0]?.id || "",
        subject,
        description,
        priority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ask-expert", "cases"] });
      setSubject("");
      setDescription("");
      setPriority("medium");
      setShowForm(false);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("genericError")),
  });

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
        <Button variant="outline" onClick={() => setShowForm((s) => !s)}>
          {showForm ? t("cancel") : `+ ${t("newCase")}`}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardTitle>{t("newCase")}</CardTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="mt-3 flex flex-col gap-3"
          >
            {error && <p className="text-sm text-danger">{error}</p>}

            {farmsData && farmsData.farms.length > 1 && (
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="min-h-11 rounded-card border border-border bg-white px-3 text-sm"
              >
                {farmsData.farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}

            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("subject")} required />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("describeIssue")}
              rows={4}
              required
              minLength={10}
              className="w-full rounded-card border border-border bg-white p-3 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="min-h-11 rounded-card border border-border bg-white px-3 text-sm"
            >
              <option value="low">{tSeverity("low")}</option>
              <option value="medium">{tSeverity("medium")}</option>
              <option value="high">{tSeverity("high")}</option>
            </select>

            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "…" : t("submit")}
            </Button>
          </form>
        </Card>
      )}

      {isLoading && <Spinner className="text-primary" />}

      <div className="flex flex-col gap-2">
        {data?.cases.map((c) => (
          <Link key={c.id} href={`/ask-expert/${c.id}`}>
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
          <Card className="text-center">
            <p className="text-sm text-foreground/50">{t("noCasesYet")}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
