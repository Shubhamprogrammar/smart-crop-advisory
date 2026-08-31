"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useMutation } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => authApi.login({ identifier, password }),
    onSuccess: ({ user }) => {
      setUser(user);
      router.push(user.role === "expert" ? "/expert" : "/dashboard");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">{t("loginTitle")}</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-foreground/70">{t("phoneOrEmail")}</label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">{t("password")}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {mutation.isError && (
            <p className="text-sm text-danger">
              {mutation.error instanceof ApiRequestError ? mutation.error.message : t("genericError")}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full">
            {mutation.isPending ? t("loggingIn") : t("loginButton")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/70">
          {t("noAccount")}{" "}
          <Link href="/register" className="font-medium text-primary">
            {t("registerLink")}
          </Link>
        </p>
      </Card>
    </main>
  );
}
