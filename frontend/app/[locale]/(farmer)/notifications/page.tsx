"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as notificationsApi from "@/lib/api/notifications";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsApi.listNotifications(),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className="flex flex-col gap-3 pb-4">
      <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>

      {isLoading && <Spinner className="text-primary" />}

      {data?.notifications.length === 0 && (
        <Card className="text-center">
          <p className="text-sm text-foreground/60">{t("empty")}</p>
        </Card>
      )}

      {data?.notifications.map((n) => (
        <Card
          key={n.id}
          className={!n.isRead ? "border-primary/40" : ""}
          onClick={() => !n.isRead && readMutation.mutate(n.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-foreground">{n.title}</p>
            {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </div>
          <p className="mt-1 text-sm text-foreground/70">{n.message}</p>
        </Card>
      ))}
    </div>
  );
}
