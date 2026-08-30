"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminApi from "@/lib/api/admin";
import { User } from "@/lib/api/auth";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"" | User["role"]>("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", search, role, page],
    queryFn: () => adminApi.listUsers({ search: search || undefined, role: role || undefined, page, limit: 20 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { role?: User["role"]; isActive?: boolean } }) =>
      adminApi.updateUser(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <h1 className="text-xl font-semibold text-foreground">{t("users")}</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t("searchUsers")}
          className="max-w-xs"
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as typeof role);
            setPage(1);
          }}
          className="min-h-11 rounded-card border border-border bg-white px-3 text-sm"
        >
          <option value="">{t("allRoles")}</option>
          <option value="farmer">{t("roleFarmer")}</option>
          <option value="expert">{t("roleExpert")}</option>
          <option value="admin">{t("roleAdmin")}</option>
        </select>
      </div>

      {isLoading && <Spinner className="text-primary" />}

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-foreground/60">
              <th className="px-4 py-3 font-medium">{t("name")}</th>
              <th className="px-4 py-3 font-medium">{t("contact")}</th>
              <th className="px-4 py-3 font-medium">{t("role")}</th>
              <th className="px-4 py-3 font-medium">{t("status")}</th>
              <th className="px-4 py-3 font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{u.name}</td>
                <td className="px-4 py-3 text-foreground/70">{u.phone ?? u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={u.id === currentUser?.id || updateMutation.isPending}
                    onChange={(e) => updateMutation.mutate({ id: u.id, input: { role: e.target.value as User["role"] } })}
                    className="min-h-9 rounded-card border border-border bg-white px-2 text-sm disabled:opacity-50"
                  >
                    <option value="farmer">{t("roleFarmer")}</option>
                    <option value="expert">{t("roleExpert")}</option>
                    <option value="admin">{t("roleAdmin")}</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.isActive ? "success" : "neutral"}>{u.isActive ? t("active") : t("inactive")}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={u.id === currentUser?.id || updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: u.id, input: { isActive: !u.isActive } })}
                    className="text-xs font-medium text-primary disabled:opacity-40"
                  >
                    {u.isActive ? t("deactivate") : t("activate")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.users.length === 0 && <p className="p-4 text-sm text-foreground/50">{t("noData")}</p>}
      </Card>

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-foreground/60">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="disabled:opacity-40"
          >
            ← {t("previous")}
          </button>
          <span>
            {t("page")} {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="disabled:opacity-40"
          >
            {t("next")} →
          </button>
        </div>
      )}
    </div>
  );
}
