"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as cropsApi from "@/lib/api/crops";
import { Card, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function TasksCard({ cycleId }: { cycleId: string | null }) {
  const t = useTranslations("dashboard");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", cycleId],
    queryFn: () => cropsApi.getCalendar(cycleId!),
    enabled: !!cycleId,
  });

  const doneMutation = useMutation({
    mutationFn: ({ stage, taskId }: { stage: string; taskId: string }) =>
      cropsApi.updateTaskStatus(cycleId!, stage, taskId, "done"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar", cycleId] }),
  });

  if (!cycleId) {
    return (
      <Card>
        <CardTitle>{t("todaysTasks")}</CardTitle>
        <p className="mt-2 text-sm text-foreground/60">{t("noCropCycle")}</p>
      </Card>
    );
  }

  const now = new Date();
  const dueTasks =
    data?.calendar.stages
      .flatMap((stage) => stage.tasks.map((task) => ({ ...task, stageName: stage.name })))
      .filter((task) => task.status === "pending" && task.dueDate && new Date(task.dueDate) <= now)
      .slice(0, 5) ?? [];

  return (
    <Card>
      <CardTitle>{t("todaysTasks")}</CardTitle>
      {isLoading && <Spinner className="mt-3 text-primary" />}
      {data && dueTasks.length === 0 && <p className="mt-2 text-sm text-foreground/60">{t("noTasks")}</p>}
      {dueTasks.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {dueTasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3">
              <button
                onClick={() => doneMutation.mutate({ stage: task.stageName, taskId: task.id })}
                disabled={doneMutation.isPending}
                aria-label={t("markDone")}
                className="h-6 w-6 shrink-0 rounded-full border-2 border-primary"
              />
              <span className="text-sm text-foreground">{task.title}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
