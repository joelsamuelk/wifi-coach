"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Cpu,
  Home,
  Settings2,
  Sparkles,
  Users,
  Wifi,
  Waypoints,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminData } from "@/lib/admin/useAdminData";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/scans", label: "Scans", icon: Wifi },
  { href: "/admin/diagnostics", label: "Diagnostics", icon: Activity },
  { href: "/admin/rooms", label: "Rooms", icon: Waypoints },
  { href: "/admin/devices", label: "Devices", icon: Cpu },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { dataset } = useAdminData();

  return (
    <aside className="w-full shrink-0 xl:w-[272px]">
      <div className="sticky top-24 overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_24px_56px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-5 px-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            WiFi Coach Admin
          </p>
          <p className="mt-1 text-sm font-medium text-slate-950">
            Internal operations dashboard
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review product activity, network quality, diagnostics, and operational health.
          </p>
        </div>
        <nav className="grid gap-1">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
                    : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-950",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl border transition-colors",
                    active
                      ? "border-white/10 bg-white/10 text-white"
                      : "border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-slate-950",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-5 rounded-[28px] border border-slate-200/70 bg-slate-50/90 px-4 py-4 text-sm text-slate-500">
          <div className="flex items-center gap-2 text-slate-950">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold">
              {dataset.source === "mock" ? "Preview data active" : "Local-first mode"}
            </span>
          </div>
          <p className="mt-2 leading-6">
            {dataset.source === "mock"
              ? "Using realistic sample operations data so the team can review the admin experience before live records exist."
              : "This admin reads from the same local storage and IndexedDB data as the consumer app."}
          </p>
          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2">
              <span className="text-xs font-medium text-slate-500">Users</span>
              <span className="text-sm font-semibold text-slate-950">{dataset.overview.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2">
              <span className="text-xs font-medium text-slate-500">Saved scans</span>
              <span className="text-sm font-semibold text-slate-950">{dataset.overview.totalScans}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
