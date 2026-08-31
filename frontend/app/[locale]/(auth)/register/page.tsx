"use client";

import { useState, FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useMutation } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      authApi.register({
        name,
        phone,
        password,
        preferredLanguage: locale as authApi.User["preferredLanguage"],
      }),
    onSuccess: ({ user }) => {
      setUser(user);
      router.push("/dashboard");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">{t("registerTitle")}</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-foreground/70">{t("name")}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">{t("phone")}</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">{t("password")}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {mutation.isError && (
            <p className="text-sm text-danger">
              {mutation.error instanceof ApiRequestError ? mutation.error.message : t("genericError")}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full">
            {mutation.isPending ? t("registering") : t("registerButton")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/70">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary">
            {t("loginLink")}
          </Link>
        </p>
      </Card>
    </main>
  );
}
