import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  outline: "border border-border bg-white text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-5 text-base font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
