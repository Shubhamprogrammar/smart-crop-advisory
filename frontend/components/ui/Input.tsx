import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`min-h-11 w-full rounded-card border border-border bg-white px-4 text-base text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 ${className}`}
        {...props}
      />
    );
  }
);
