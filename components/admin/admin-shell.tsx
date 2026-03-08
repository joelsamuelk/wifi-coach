"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  Search,
} from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { WifiCoachLogo } from "@/components/wifi-coach-logo";
import { useAdminData } from "@/lib/admin/useAdminData";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Overview",
    subtitle: "Monitor product activity, WiFi quality, and operational health at a glance.",
  },
  "/admin/users": {
    title: "Users",
    subtitle: "Inspect support context, recent activity, and network outcomes for each account.",
  },
  "/admin/scans": {
    title: "Scans",
    subtitle: "Review saved room-by-room scans, compare outcomes, and spot weak sessions quickly.",
  },
  "/admin/diagnostics": {
    title: "Diagnostics",
    subtitle: "Track Fix My WiFi runs, causes, and recommended actions across recent sessions.",
  },
  "/admin/rooms": {
    title: "Rooms",
    subtitle: "Identify room types and floors that most often underperform.",
  },
  "/admin/devices": {
    title: "Devices",
    subtitle: "Review discovery capability, connected device quality, and weak device patterns.",
  },
  "/admin/analytics": {
    title: "Analytics",
    subtitle: "Understand long-term score distribution, recommendation frequency, and completion trends.",
  },
  "/admin/settings": {
    title: "Settings",
    subtitle: "Adjust internal config surfaces, thresholds, providers, and feature flags.",
  },
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dataset } = useAdminData();
  const meta =
    PAGE_META[pathname] ??
    PAGE_META[
      Object.keys(PAGE_META).find((key) => key !== "/admin" && pathname.startsWith(key)) ?? "/admin"
    ];

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-6 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex items-center gap-3">
              <WifiCoachLogo size="sm" />
              <div className="hidden h-6 w-px bg-slate-200 xl:block" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="truncate text-[22px] font-semibold tracking-tight text-slate-950">
                  {meta.title}
                </h1>
                <span className="hidden rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 xl:inline-flex">
                  {dataset.source === "mock" ? "Preview data" : "Local data"}
                </span>
              </div>
              <p className="hidden text-sm leading-6 text-slate-500 lg:block">
                {meta.subtitle}
              </p>
            </div>
          </div>
          <div className="hidden min-w-[260px] flex-1 items-center lg:flex xl:max-w-md">
            <label className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search scans, users, diagnostics"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/90 pl-11 pr-4 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-primary/40 focus:bg-white"
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.04)] md:inline-flex"
            >
              <CalendarDays className="h-4 w-4 text-slate-500" />
              Last 30 days
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition-colors hover:text-slate-950"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.04)] md:flex"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-950 text-xs font-semibold text-white">
                WC
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-950">Ops Admin</p>
                <p className="text-xs text-slate-500">Internal</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition-colors hover:text-slate-950"
            >
              Consumer app
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-6 xl:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
