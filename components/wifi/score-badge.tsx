"use client";

import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompactLabel, type WiFiLabel } from "@/lib/types";

interface ScoreBadgeProps {
  label: WiFiLabel;
  className?: string;
  showIcon?: boolean;
}

export function ScoreBadge({
  label,
  className,
  showIcon = false,
}: ScoreBadgeProps) {
  const Icon =
    label === "Excellent" || label === "Good"
      ? CheckCircle
      : label === "Fair"
        ? AlertCircle
        : XCircle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.02em] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)]",
        (label === "Excellent" || label === "Good") &&
          "border-score-great/15 bg-score-great/10 text-score-great",
        label === "Fair" && "border-score-fair/15 bg-score-fair/10 text-score-fair",
        label === "Weak" && "border-score-weak/15 bg-score-weak/10 text-score-weak",
        className,
      )}
    >
      {showIcon ? <Icon className="h-3.5 w-3.5" /> : null}
      {getCompactLabel(label)}
    </span>
  );
}
