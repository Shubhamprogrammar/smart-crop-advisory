"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminNav } from "@/components/layout/AdminNav";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  useCurrentUser();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [status, user, router]);

  if (status === "idle" || status === "loading" || (status === "authenticated" && user?.role !== "admin")) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted/30">
      <AdminHeader />
      <AdminNav />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</div>
    </div>
  );
}
