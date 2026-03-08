"use client";

import { cn } from "@/lib/utils";

export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-card flex flex-wrap items-center gap-3 rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_16px_36px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
      {children}
    </span>
  );
}
