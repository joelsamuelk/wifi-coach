"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatPillProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatPill({ label, value, icon: Icon, className }: StatPillProps) {
  return (
    <div
      className={cn(
        "surface-card flex flex-col items-center rounded-[24px] px-4 py-3.5 text-center",
        className
      )}
    >
      {Icon && <Icon className="mb-1.5 h-4 w-4 text-primary/75" />}
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-1 text-xl font-bold text-foreground tracking-tight">{value}</span>
    </div>
  );
}
