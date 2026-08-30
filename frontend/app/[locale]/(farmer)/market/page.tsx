"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import * as marketApi from "@/lib/api/market";
import * as cropsApi from "@/lib/api/crops";
import { useFarmStore } from "@/store/farmStore";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

export default function MarketPage() {
  const t = useTranslations("market");
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const [cropName, setCropName] = useState("");

  const { data: cropsData } = useQuery({
    queryKey: ["crops", "catalog"],
    queryFn: () => cropsApi.listCrops(),
  });

  const { data: priceData, isLoading: priceLoading } = useQuery({
    queryKey: ["market", "price", cropName],
    queryFn: () => marketApi.getCurrentPrice(cropName),
    enabled: !!cropName,
  });

  const { data: trendData } = useQuery({
    queryKey: ["market", "trend", cropName],
    queryFn: () => marketApi.getTrend(cropName),
    enabled: !!cropName,
  });

  const { data: recData } = useQuery({
    queryKey: ["market", "recommendation", cropName, selectedFarmId],
    queryFn: () => marketApi.getSellingRecommendation(cropName, selectedFarmId!),
    enabled: !!cropName && !!selectedFarmId,
  });

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>

      <select
        value={cropName}
        onChange={(e) => setCropName(e.target.value)}
        className="min-h-11 rounded-card border border-border bg-white px-3 text-base"
      >
        <option value="">{t("selectCrop")}</option>
        {cropsData?.crops.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      {priceLoading && <Spinner className="text-primary" />}

      {priceData && (
        <Card>
          <CardTitle>{t("currentPrice")}</CardTitle>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            ₹{priceData.modalPrice.toLocaleString()}{" "}
            <span className="text-sm font-normal text-foreground/60">/{priceData.unit}</span>
          </p>
          <p className="text-xs text-foreground/50">
            {t("range")}: ₹{priceData.minPrice.toLocaleString()} – ₹{priceData.maxPrice.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-warning">⚠ {priceData.disclaimer}</p>
        </Card>
      )}

      {trendData && (
        <Card>
          <CardTitle>{t("trend")}</CardTitle>
          <Badge
            tone={
              trendData.prediction.direction === "rising"
                ? "success"
                : trendData.prediction.direction === "falling"
                  ? "danger"
                  : "info"
            }
          >
            {t(trendData.prediction.direction)}
          </Badge>
        </Card>
      )}

      {recData && (
        <Card>
          <CardTitle>{t("sellingRecommendation")}</CardTitle>
          <p className="mt-2 text-sm text-foreground/70">{recData.recommendation}</p>
        </Card>
      )}
    </div>
  );
}
