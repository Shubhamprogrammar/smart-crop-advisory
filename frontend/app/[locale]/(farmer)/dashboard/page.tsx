"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/store/authStore";
import { useFarmStore } from "@/store/farmStore";
import { useFarms } from "@/lib/hooks/useFarms";
import * as cropsApi from "@/lib/api/crops";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { SoilHealthCard } from "@/components/dashboard/SoilHealthCard";
import { DiseaseRiskCard } from "@/components/dashboard/DiseaseRiskCard";
import { AdvisoryCard } from "@/components/dashboard/AdvisoryCard";
import { IrrigationCard } from "@/components/dashboard/IrrigationCard";
import { CropCycleCard } from "@/components/dashboard/CropCycleCard";
import { TasksCard } from "@/components/dashboard/TasksCard";
import { MarketPriceCard } from "@/components/dashboard/MarketPriceCard";
import { ProfitEstimateCard } from "@/components/dashboard/ProfitEstimateCard";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useAuthStore((s) => s.user);
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const { data: farmsData, isLoading: farmsLoading } = useFarms();

  const farm = farmsData?.farms.find((f) => f.id === selectedFarmId);

  const { data: cycleData, isLoading: cycleLoading } = useQuery({
    queryKey: ["crop-cycle", "active", selectedFarmId],
    queryFn: () => cropsApi.getActiveCycle(selectedFarmId!),
    enabled: !!selectedFarmId,
  });

  if (farmsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!farmsData || farmsData.farms.length === 0) {
    return (
      <Card className="mt-4 text-center">
        <p className="text-lg font-medium text-foreground">{t("noFarmsYet")}</p>
        <p className="mt-1 text-sm text-foreground/60">{t("noFarmsHint")}</p>
        <Link href="/farms/new">
          <Button className="mt-4 w-full">{t("addFarm")}</Button>
        </Link>
      </Card>
    );
  }

  if (!farm || cycleLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner className="text-primary" />
      </div>
    );
  }

  const cycle = cycleData?.cycle ?? null;
  const hasCycle = Boolean(cycle);
  const cropName = cycle ? (typeof cycle.crop === "string" ? cycle.crop : cycle.crop.name) : null;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {t("welcomeBack")}, {user?.name}
        </h1>
        <p className="text-sm text-foreground/60">
          {farm.name} · {farm.landAreaAcres} {t("acres")}
        </p>
      </div>

      <CropCycleCard cycle={cycle} />
      <WeatherCard farmId={farm.id} />
      <AdvisoryCard farmId={farm.id} hasCycle={hasCycle} />
      <SoilHealthCard farmId={farm.id} />
      <DiseaseRiskCard farmId={farm.id} hasCycle={hasCycle} />
      <IrrigationCard farmId={farm.id} hasCycle={hasCycle} />
      <TasksCard cycleId={cycle?.id ?? null} />
      <MarketPriceCard cropName={cropName} />
      <ProfitEstimateCard />
    </div>
  );
}
