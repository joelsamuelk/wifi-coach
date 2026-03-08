"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Info, CheckCircle } from "lucide-react";

interface InlineAlertProps {
  variant?: "info" | "warning" | "error" | "success";
  children: React.ReactNode;
  className?: string;
}

const icons = {
  info: Info,
  warning: AlertCircle,
  error: AlertCircle,
  success: CheckCircle,
};

const styles = {
  info: "border-primary/10 bg-primary/7 text-primary",
  warning: "border-score-fair/15 bg-score-fair/8 text-score-fair",
  error: "border-score-weak/15 bg-score-weak/8 text-score-weak",
  success: "border-score-great/15 bg-score-great/8 text-score-great",
};

export function InlineAlert({
  variant = "info",
  children,
  className,
}: InlineAlertProps) {
  const Icon = icons[variant];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[24px] border p-4 text-sm font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)]",
        styles[variant],
        className
      )}
      role="alert"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-current/10 shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="pt-0.5 leading-6">{children}</div>
    </div>
  );
}
