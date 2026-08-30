"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Spinner } from "@/components/ui/Spinner";

export default function FarmerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  useCurrentUser();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "idle" || status === "loading") {
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
      <Header />
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-4">{children}</div>
      <BottomNav />
    </div>
  );
}
