import { HTMLAttributes, ReactNode } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-card border border-border bg-white p-5 shadow-sm ${className}`} {...props} />;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-base font-semibold text-foreground ${className}`}>{children}</h3>;
}
