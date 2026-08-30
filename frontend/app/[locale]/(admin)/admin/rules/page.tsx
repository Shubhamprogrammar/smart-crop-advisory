"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminApi from "@/lib/api/admin";
import { ApiRequestError } from "@/lib/apiClient";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type FieldValues = Record<keyof adminApi.RuleThresholds, string>;

function thresholdsToValues(thresholds: adminApi.RuleThresholds): FieldValues {
  return {
    heavyRainProbability: String(thresholds.heavyRainProbability),
    heavyRainMm: String(thresholds.heavyRainMm),
    strongWindKmh: String(thresholds.strongWindKmh),
    heatStressC: String(thresholds.heatStressC),
    coldStressC: String(thresholds.coldStressC),
  };
}

function RuleThresholdsForm({ initial }: { initial: adminApi.RuleThresholds }) {
  const t = useTranslations("admin");
  const queryClient = useQueryClient();
  const [values, setValues] = useState<FieldValues>(() => thresholdsToValues(initial));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updateRuleThresholds({
        heavyRainProbability: Number(values.heavyRainProbability),
        heavyRainMm: Number(values.heavyRainMm),
        strongWindKmh: Number(values.strongWindKmh),
        heatStressC: Number(values.heatStressC),
        coldStressC: Number(values.coldStressC),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rules"] });
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("genericError")),
  });

  return (
    <Card>
      <CardTitle>{t("weatherAdvisoryThresholds")}</CardTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="mt-3 flex flex-col gap-3"
      >
        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm text-success">{t("saved")}</p>}

        <label className="flex flex-col gap-1 text-sm text-foreground/70">
          {t("heavyRainProbability")}
          <Input
            type="number"
            min={0}
            max={100}
            value={values.heavyRainProbability}
            onChange={(e) => setValues((v) => ({ ...v, heavyRainProbability: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-foreground/70">
          {t("heavyRainMm")}
          <Input
            type="number"
            min={0}
            value={values.heavyRainMm}
            onChange={(e) => setValues((v) => ({ ...v, heavyRainMm: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-foreground/70">
          {t("strongWindKmh")}
          <Input
            type="number"
            min={0}
            value={values.strongWindKmh}
            onChange={(e) => setValues((v) => ({ ...v, strongWindKmh: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-foreground/70">
          {t("heatStressC")}
          <Input
            type="number"
            value={values.heatStressC}
            onChange={(e) => setValues((v) => ({ ...v, heatStressC: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-foreground/70">
          {t("coldStressC")}
          <Input
            type="number"
            value={values.coldStressC}
            onChange={(e) => setValues((v) => ({ ...v, coldStressC: e.target.value }))}
          />
        </label>

        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "…" : t("save")}
        </Button>
      </form>
    </Card>
  );
}

export default function AdminRulesPage() {
  const t = useTranslations("admin");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "rules"],
    queryFn: () => adminApi.getRuleThresholds(),
  });

  return (
    <div className="flex max-w-md flex-col gap-4 pb-6">
      <h1 className="text-xl font-semibold text-foreground">{t("rules")}</h1>
      <p className="text-sm text-foreground/60">{t("rulesDescription")}</p>

      {isLoading && <Spinner className="text-primary" />}
      {data && <RuleThresholdsForm initial={data.thresholds} />}
    </div>
  );
}
