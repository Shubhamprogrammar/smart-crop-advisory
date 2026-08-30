"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expertApi from "@/lib/api/expert";
import { ApiRequestError } from "@/lib/apiClient";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge, priorityTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AuthenticatedImage } from "@/components/ui/AuthenticatedImage";

function riskTone(level?: string): "success" | "warning" | "danger" | "neutral" {
  if (level === "high") return "danger";
  if (level === "medium") return "warning";
  if (level === "low") return "success";
  return "neutral";
}

export default function ExpertCaseDetailPage() {
  const t = useTranslations("expert");
  const tSeverity = useTranslations("severity");
  const tStage = useTranslations("cropStage");
  const tIrrigation = useTranslations("irrigationType");
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["expert", "case", caseId],
    queryFn: () => expertApi.getCaseDetail(caseId),
  });

  const claimMutation = useMutation({
    mutationFn: () => expertApi.assignCase(caseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expert", "case", caseId] }),
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("genericError")),
  });

  const respondMutation = useMutation({
    mutationFn: () => expertApi.addResponse(caseId, { message, recommendation: recommendation || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert", "case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["expert", "cases"] });
      setMessage("");
      setRecommendation("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("genericError")),
  });

  const resolveMutation = useMutation({
    mutationFn: () => expertApi.updateCaseStatus(caseId, "resolved"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert", "case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["expert", "cases"] });
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("genericError")),
  });

  if (isLoading) return <Spinner className="text-primary" />;
  if (!data) return null;

  const { case: c, farmer, farm, cropCycle, soilReport, weather, diseaseDetection, responses } = data;
  const cropLabel = cropCycle ? (typeof cropCycle.crop === "string" ? cropCycle.crop : cropCycle.crop.name) : null;
  const canAct = c.status !== "resolved" && c.status !== "closed";

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div>
        <div className="flex items-center gap-2">
          <Badge tone={priorityTone(c.priority)}>{tSeverity(c.priority)}</Badge>
          <Badge tone="neutral">{c.status}</Badge>
        </div>
        <h1 className="mt-2 text-xl font-semibold text-foreground">{c.subject}</h1>
        <p className="mt-1 text-sm text-foreground/70">{c.description}</p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {c.status === "open" && (
        <Button onClick={() => claimMutation.mutate()} disabled={claimMutation.isPending}>
          {claimMutation.isPending ? "…" : t("claimCase")}
        </Button>
      )}

      <Card>
        <CardTitle>{t("farmerInfo")}</CardTitle>
        <p className="mt-2 text-sm text-foreground">{farmer.name}</p>
        {farmer.phone && <p className="text-sm text-foreground/60">📱 {farmer.phone}</p>}
        {farmer.farmingExperienceYears !== undefined && (
          <p className="text-sm text-foreground/60">
            🌾 {t("experience")}: {farmer.farmingExperienceYears} {t("years")}
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>{t("farmInfo")}</CardTitle>
        <p className="mt-2 text-sm text-foreground">{farm.name}</p>
        <p className="text-sm text-foreground/60">
          {farm.landAreaAcres} {t("acres")} · {tIrrigation(farm.irrigationType)}
          {farm.soilType ? ` · ${farm.soilType}` : ""}
        </p>
        {cropLabel && (
          <p className="mt-1 text-sm text-foreground/60">
            🌱 {cropLabel}
            {cropCycle && ` — ${tStage(cropCycle.currentStage)}`}
          </p>
        )}
      </Card>

      {soilReport && (
        <Card>
          <CardTitle>{t("soilReport")}</CardTitle>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-foreground/70">
            {soilReport.nitrogen !== undefined && <p>N: {soilReport.nitrogen}</p>}
            {soilReport.phosphorus !== undefined && <p>P: {soilReport.phosphorus}</p>}
            {soilReport.potassium !== undefined && <p>K: {soilReport.potassium}</p>}
            {soilReport.ph !== undefined && <p>pH: {soilReport.ph}</p>}
          </div>
          {soilReport.healthScore !== undefined && (
            <p className="mt-2 text-sm text-foreground">
              {t("healthScore")}: {soilReport.healthScore}/100
            </p>
          )}
          {soilReport.interpretation && (
            <p className="mt-1 text-sm text-foreground/60">{soilReport.interpretation}</p>
          )}
        </Card>
      )}

      {weather && (
        <Card>
          <CardTitle>{t("weather")}</CardTitle>
          <p className="mt-2 text-sm text-foreground">
            {weather.snapshot.current.temperature}°C · {weather.snapshot.current.condition}
          </p>
          <p className="text-sm text-foreground/60">
            💧 {weather.snapshot.current.humidity}% · 🌧️ {weather.snapshot.current.rainProbability}%
          </p>
          {weather.stale && <p className="mt-1 text-xs text-warning">{weather.message}</p>}
        </Card>
      )}

      {diseaseDetection && (
        <Card>
          <CardTitle>{t("aiDiagnosis")}</CardTitle>
          <AuthenticatedImage
            src={diseaseDetection.imageUrl}
            alt={diseaseDetection.predictedDisease ?? diseaseDetection.cropType}
            className="mt-2 h-64 w-full rounded-card object-cover"
          />
          <div className="mt-3 flex items-center gap-2">
            <p className="font-medium text-foreground">{diseaseDetection.predictedDisease ?? t("noDiagnosis")}</p>
            {diseaseDetection.severity && (
              <Badge tone={riskTone(diseaseDetection.severity)}>{tSeverity(diseaseDetection.severity)}</Badge>
            )}
          </div>
          {diseaseDetection.confidence !== undefined && (
            <p className="mt-1 text-xs text-foreground/50">
              {t("confidence")}: {Math.round(diseaseDetection.confidence * 100)}%
            </p>
          )}
          {diseaseDetection.symptoms.length > 0 && (
            <p className="mt-2 text-sm text-foreground/70">
              <span className="font-medium">{t("symptoms")}:</span> {diseaseDetection.symptoms.join(", ")}
            </p>
          )}
          {diseaseDetection.treatment.length > 0 && (
            <p className="mt-1 text-sm text-foreground/70">
              <span className="font-medium">{t("aiRecommendation")}:</span> {diseaseDetection.treatment.join(", ")}
            </p>
          )}
        </Card>
      )}

      <div>
        <CardTitle>{t("responses")}</CardTitle>
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
          {responses.length === 0 && <p className="text-sm text-foreground/50">{t("noResponsesYet")}</p>}
        </div>
      </div>

      {canAct && (
        <Card>
          <CardTitle>{t("addResponse")}</CardTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              respondMutation.mutate();
            }}
            className="mt-3 flex flex-col gap-3"
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              rows={4}
              required
              className="w-full rounded-card border border-border bg-white p-3 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder={t("recommendationPlaceholder")}
              rows={3}
              className="w-full rounded-card border border-border bg-white p-3 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={respondMutation.isPending}>
                {respondMutation.isPending ? "…" : t("send")}
              </Button>
              {(c.status === "assigned" || c.status === "in_progress") && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resolveMutation.mutate()}
                  disabled={resolveMutation.isPending}
                >
                  {t("markResolved")}
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
