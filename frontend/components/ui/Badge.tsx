import { ReactNode } from "react";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
  neutral: "bg-muted text-foreground/70",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

export function priorityTone(priority: string): Tone {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  return "info";
}
