"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function SurfaceCard({
  className,
  children,
  interactive = false,
}: {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface-card",
        interactive && "soft-press transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function MetricTile({
  icon: Icon,
  label,
  value,
  detail,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface-subtle hairline rounded-[24px] px-4 py-3.5", className)}>
      {Icon ? (
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/75 text-primary shadow-[0_4px_10px_rgba(15,23,42,0.05)]">
          <Icon className="h-4 w-4" />
        </div>
      ) : null}
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-xl font-bold tracking-tight text-foreground">{value}</div>
      {detail ? <div className="mt-1.5 text-xs text-muted-foreground">{detail}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <SurfaceCard
      className={cn("flex flex-col items-center gap-4 px-6 py-8 text-center", className)}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary/10 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
        <Icon className="h-7 w-7" />
      </div>
      <div className="max-w-[18rem]">
        <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </SurfaceCard>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 pb-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28 rounded-full bg-muted" />
        <Skeleton className="h-7 w-44 rounded-full bg-muted" />
      </div>
      <Skeleton className="h-11 w-11 rounded-2xl bg-muted" />
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("surface-card p-5", className)}>
      <Skeleton className="h-4 w-24 rounded-full bg-muted" />
      <Skeleton className="mt-3 h-7 w-2/3 rounded-full bg-muted" />
      <Skeleton className="mt-2 h-4 w-full rounded-full bg-muted" />
      <Skeleton className="mt-2 h-4 w-4/5 rounded-full bg-muted" />
    </div>
  );
}
