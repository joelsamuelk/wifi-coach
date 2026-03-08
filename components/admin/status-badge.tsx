"use client";

import { cn } from "@/lib/utils";

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
        tone === "neutral" && "border-slate-200 bg-slate-100 text-slate-600",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "danger" && "border-rose-200 bg-rose-50 text-rose-700",
        tone === "info" && "border-blue-200 bg-blue-50 text-blue-700",
      )}
    >
      {label}
    </span>
  );
}
