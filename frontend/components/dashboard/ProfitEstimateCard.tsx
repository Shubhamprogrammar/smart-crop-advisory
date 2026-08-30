"use client";

import { useState, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { apiClient, unwrap } from "@/lib/apiClient";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProfitResult {
  totalCost: number;
  expectedRevenue: number;
  expectedProfit: number;
  roiPercent: number | null;
  disclaimer: string;
}

async function calculateProfit(input: Record<string, number>) {
  return unwrap<{ result: ProfitResult }>(apiClient.post("/api/profit/calculate", input)).then((d) => d.result);
}

const FIELDS = ["seedCost", "fertilizerCost", "pesticideCost", "labourCost", "irrigationCost", "expectedYield", "marketPrice"] as const;

export function ProfitEstimateCard() {
  const t = useTranslations("dashboard");
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const mutation = useMutation({ mutationFn: calculateProfit });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: Record<string, number> = { otherCosts: 0 };
    for (const field of FIELDS) input[field] = Number(values[field] ?? 0);
    mutation.mutate(input);
  }

  return (
    <Card>
      <CardTitle>{t("expectedProfit")}</CardTitle>

      {!expanded && !mutation.data && (
        <Button variant="outline" className="mt-3 w-full" onClick={() => setExpanded(true)}>
          {t("calculateProfit")}
        </Button>
      )}

      {expanded && !mutation.data && (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          {FIELDS.map((field) => (
            <Input
              key={field}
              type="number"
              min={0}
              placeholder={t(`profitField_${field}`)}
              value={values[field] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
              required
            />
          ))}
          <Button type="submit" disabled={mutation.isPending} className="mt-1 w-full">
            {t("calculate")}
          </Button>
        </form>
      )}

      {mutation.data && (
        <div className="mt-3">
          <p className="text-3xl font-semibold text-foreground">
            ₹{Math.round(mutation.data.expectedProfit).toLocaleString()}
          </p>
          {mutation.data.roiPercent !== null && (
            <p className="text-sm text-foreground/60">{t("roi")}: {mutation.data.roiPercent}%</p>
          )}
          <p className="mt-2 text-xs text-foreground/50">{mutation.data.disclaimer}</p>
          <button
            onClick={() => {
              mutation.reset();
              setExpanded(false);
            }}
            className="mt-2 text-xs font-medium text-primary"
          >
            {t("recalculate")}
          </button>
        </div>
      )}
    </Card>
  );
}
