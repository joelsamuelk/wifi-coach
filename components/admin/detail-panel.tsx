"use client";

import { SurfaceCard } from "@/components/wifi/app-primitives";

export function DetailPanel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <SurfaceCard className="border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </SurfaceCard>
  );
}
