"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CropCycle } from "@/lib/api/crops";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function CropCycleCard({ cycle }: { cycle: CropCycle | null }) {
  const t = useTranslations("dashboard");
  const tStage = useTranslations("cropStage");

  if (!cycle) {
    return (
      <Card>
        <CardTitle>{t("currentCrop")}</CardTitle>
        <p className="mt-2 text-sm text-foreground/60">{t("noCropCycle")}</p>
        <Link href="/farms">
          <Button variant="outline" className="mt-3 w-full">
            {t("selectCrop")}
          </Button>
        </Link>
      </Card>
    );
  }

  const cropName = typeof cycle.crop === "string" ? cycle.crop : cycle.crop.name;

  return (
    <Card>
      <CardTitle>{t("currentCrop")}</CardTitle>
      <div className="mt-3 flex items-center gap-3">
        <p className="text-2xl font-semibold capitalize text-foreground">{cropName}</p>
        <Badge tone="info">{tStage(cycle.currentStage)}</Badge>
      </div>
    </Card>
  );
}
