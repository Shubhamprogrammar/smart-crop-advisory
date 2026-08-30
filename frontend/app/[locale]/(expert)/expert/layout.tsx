"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { ExpertHeader } from "@/components/layout/ExpertHeader";
import { ExpertNav } from "@/components/layout/ExpertNav";
import { Spinner } from "@/components/ui/Spinner";

export default function ExpertLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  useCurrentUser();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user) {
      if (user.role === "admin") router.replace("/admin");
      else if (user.role === "farmer") router.replace("/dashboard");
    }
  }, [status, user, router]);

  if (status === "idle" || status === "loading" || (status === "authenticated" && user?.role !== "expert")) {
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
    <div className="flex min-h-full flex-1 flex-col">
      <ExpertHeader />
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">{children}</div>
      <ExpertNav />
    </div>
  );
}
