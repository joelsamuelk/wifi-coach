"use client";

import type { LucideIcon } from "lucide-react";
import { SurfaceCard } from "@/components/wifi/app-primitives";

export function KPIStatCard({
  icon: Icon,
  label,
  value,
  helper,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  helper?: string;
  trend?: React.ReactNode;
}) {
  return (
    <SurfaceCard className="border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <div className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-950">{value}</div>
          {helper ? <p className="mt-1.5 text-sm leading-6 text-slate-500">{helper}</p> : null}
          {trend ? <div className="mt-3">{trend}</div> : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.07] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </SurfaceCard>
  );
}
