"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import * as farmsApi from "@/lib/api/farms";
import { useFarmStore } from "@/store/farmStore";
import { ApiRequestError } from "@/lib/apiClient";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewFarmPage() {
  const t = useTranslations("farms");
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSelectedFarmId = useFarmStore((s) => s.setSelectedFarmId);

  const [name, setName] = useState("");
  const [landAreaAcres, setLandAreaAcres] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      farmsApi.createFarm({
        name,
        landAreaAcres: Number(landAreaAcres),
        location: { latitude: Number(latitude), longitude: Number(longitude) },
      }),
    onSuccess: ({ farm }) => {
      setSelectedFarmId(farm.id);
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      router.push("/dashboard");
    },
  });

  function useMyLocation() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError(t("geolocationUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      () => setLocationError(t("geolocationDenied"))
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-8">
      <Card className="w-full max-w-sm">
        <CardTitle>{t("addNewFarm")}</CardTitle>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-foreground/70">{t("farmName")}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">{t("landArea")}</label>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              value={landAreaAcres}
              onChange={(e) => setLandAreaAcres(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-foreground/70">{t("location")}</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="any"
                placeholder={t("latitude")}
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
              <Input
                type="number"
                step="any"
                placeholder={t("longitude")}
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>
            <button type="button" onClick={useMyLocation} className="mt-2 text-sm font-medium text-primary">
              📍 {t("useMyLocation")}
            </button>
            {locationError && <p className="mt-1 text-sm text-danger">{locationError}</p>}
          </div>

          {mutation.isError && (
            <p className="text-sm text-danger">
              {mutation.error instanceof ApiRequestError ? mutation.error.message : t("genericError")}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full">
            {mutation.isPending ? t("saving") : t("save")}
          </Button>
        </form>
      </Card>
    </main>
  );
}
