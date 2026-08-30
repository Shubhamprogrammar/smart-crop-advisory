"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminApi from "@/lib/api/admin";
import { ApiRequestError } from "@/lib/apiClient";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const SEASONS = ["kharif", "rabi", "zaid", "perennial"] as const;

export default function AdminCropsPage() {
  const t = useTranslations("admin");
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [seasons, setSeasons] = useState<string[]>([]);
  const [growthDurationDays, setGrowthDurationDays] = useState("");
  const [diseaseDetectionSupported, setDiseaseDetectionSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "crops"],
    queryFn: () => adminApi.listCrops(),
  });

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setName("");
    setCategory("");
    setSeasons([]);
    setGrowthDurationDays("");
    setDiseaseDetectionSupported(false);
    setError(null);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createCrop({
        name,
        category: category || undefined,
        seasons,
        growthDurationDays: growthDurationDays ? Number(growthDurationDays) : undefined,
        diseaseDetectionSupported,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "crops"] });
      queryClient.invalidateQueries({ queryKey: ["crops", "catalog"] });
      resetForm();
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("genericError")),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updateCrop(editingId!, {
        category: category || undefined,
        seasons,
        growthDurationDays: growthDurationDays ? Number(growthDurationDays) : undefined,
        diseaseDetectionSupported,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "crops"] });
      queryClient.invalidateQueries({ queryKey: ["crops", "catalog"] });
      resetForm();
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("genericError")),
  });

  function startEdit(crop: NonNullable<typeof data>["crops"][number]) {
    setEditingId(crop.id);
    setName(crop.name);
    setCategory(crop.category ?? "");
    setGrowthDurationDays(crop.growthDurationDays ? String(crop.growthDurationDays) : "");
    setDiseaseDetectionSupported(crop.diseaseDetectionSupported);
    setSeasons(crop.seasons);
    setShowForm(true);
  }

  function toggleSeason(s: string) {
    setSeasons((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t("crops")}</h1>
        <Button
          variant="outline"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
          {showForm ? t("cancel") : `+ ${t("addCrop")}`}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardTitle>{editingId ? t("editCrop") : t("addCrop")}</CardTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingId) updateMutation.mutate();
              else createMutation.mutate();
            }}
            className="mt-3 flex flex-col gap-3"
          >
            {error && <p className="text-sm text-danger">{error}</p>}
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("cropName")}
              disabled={!!editingId}
              required
            />
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("category")} />
            <Input
              type="number"
              value={growthDurationDays}
              onChange={(e) => setGrowthDurationDays(e.target.value)}
              placeholder={t("growthDurationDays")}
              min={1}
            />
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSeason(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    seasons.includes(s) ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={diseaseDetectionSupported}
                onChange={(e) => setDiseaseDetectionSupported(e.target.checked)}
              />
              {t("diseaseDetectionSupported")}
            </label>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {t("save")}
            </Button>
          </form>
        </Card>
      )}

      {isLoading && <Spinner className="text-primary" />}

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-foreground/60">
              <th className="px-4 py-3 font-medium">{t("cropName")}</th>
              <th className="px-4 py-3 font-medium">{t("category")}</th>
              <th className="px-4 py-3 font-medium">{t("growthDurationDays")}</th>
              <th className="px-4 py-3 font-medium">{t("diseaseDetectionSupported")}</th>
              <th className="px-4 py-3 font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.crops.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 capitalize text-foreground">{c.name}</td>
                <td className="px-4 py-3 text-foreground/70">{c.category ?? "—"}</td>
                <td className="px-4 py-3 text-foreground/70">{c.growthDurationDays ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={c.diseaseDetectionSupported ? "success" : "neutral"}>
                    {c.diseaseDetectionSupported ? t("yes") : t("no")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(c)} className="text-xs font-medium text-primary">
                    {t("edit")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.crops.length === 0 && <p className="p-4 text-sm text-foreground/50">{t("noData")}</p>}
      </Card>
    </div>
  );
}
