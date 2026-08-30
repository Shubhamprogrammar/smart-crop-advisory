"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as weatherApi from "@/lib/api/weather";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function WeatherCard({ farmId }: { farmId: string }) {
  const t = useTranslations("dashboard");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["weather", farmId],
    queryFn: () => weatherApi.getFarmWeather(farmId),
  });

  return (
    <Card>
      <CardTitle>{t("currentWeather")}</CardTitle>
      {isLoading && <Spinner className="mt-3 text-primary" />}
      {isError && <p className="mt-2 text-sm text-foreground/60">{t("weatherUnavailable")}</p>}
      {data && (
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-3xl font-semibold text-foreground">
              {Math.round(data.snapshot.current.temperature)}°C
            </p>
            <p className="text-sm text-foreground/60">{data.snapshot.current.condition}</p>
          </div>
          <div className="text-right text-sm text-foreground/60">
            <p>💧 {data.snapshot.current.humidity}%</p>
            <p>🌧️ {data.snapshot.current.rainProbability}%</p>
          </div>
        </div>
      )}
      {data?.stale && <p className="mt-2 text-xs text-warning">{data.message}</p>}
    </Card>
  );
}
