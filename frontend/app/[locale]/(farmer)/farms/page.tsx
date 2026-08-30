"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { useFarms } from "@/lib/hooks/useFarms";
import { useFarmStore } from "@/store/farmStore";
import * as cropsApi from "@/lib/api/crops";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

function FarmCropCycleRow({ farmId }: { farmId: string }) {
  const t = useTranslations("farms");
  const tStage = useTranslations("cropStage");
  const queryClient = useQueryClient();
  const [cropName, setCropName] = useState("");

  const { data: cycleData } = useQuery({
    queryKey: ["crop-cycle", "active", farmId],
    queryFn: () => cropsApi.getActiveCycle(farmId),
  });

  const { data: cropsData } = useQuery({
    queryKey: ["crops", "catalog"],
    queryFn: () => cropsApi.listCrops(),
  });

  const startMutation = useMutation({
    mutationFn: () => cropsApi.startCropCycle(farmId, { cropName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crop-cycle", "active", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farms"] });
    },
  });

  if (cycleData?.cycle) {
    const cropLabel =
      typeof cycleData.cycle.crop === "string" ? cycleData.cycle.crop : cycleData.cycle.crop.name;
    return (
      <p className="mt-2 text-sm text-foreground/70">
        🌱 {cropLabel} — {tStage(cycleData.cycle.currentStage)}
      </p>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <select
        value={cropName}
        onChange={(e) => setCropName(e.target.value)}
        className="min-h-11 flex-1 rounded-card border border-border bg-white px-3 text-sm"
      >
        <option value="">{t("selectCrop")}</option>
        {cropsData?.crops.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <Button
        variant="outline"
        disabled={!cropName || startMutation.isPending}
        onClick={() => startMutation.mutate()}
      >
        {t("start")}
      </Button>
    </div>
  );
}

export default function FarmsPage() {
  const t = useTranslations("farms");
  const tIrrigation = useTranslations("irrigationType");
  const { data, isLoading } = useFarms();
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const setSelectedFarmId = useFarmStore((s) => s.setSelectedFarmId);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t("myFarms")}</h1>
        <Link href="/farms/new">
          <Button variant="outline">+ {t("addFarm")}</Button>
        </Link>
      </div>

      {isLoading && <Spinner className="text-primary" />}

      {data?.farms.length === 0 && (
        <Card className="text-center">
          <p className="text-sm text-foreground/60">{t("noFarmsYet")}</p>
        </Card>
      )}

      {data?.farms.map((farm) => (
        <Card key={farm.id} className={farm.id === selectedFarmId ? "border-primary" : ""}>
          <div className="flex items-center justify-between">
            <CardTitle>{farm.name}</CardTitle>
            {farm.id !== selectedFarmId && (
              <button onClick={() => setSelectedFarmId(farm.id)} className="text-xs font-medium text-primary">
                {t("select")}
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-foreground/60">
            {farm.landAreaAcres} {t("acres")} · {tIrrigation(farm.irrigationType)}
          </p>
          <FarmCropCycleRow farmId={farm.id} />
        </Card>
      ))}
    </div>
  );
}
