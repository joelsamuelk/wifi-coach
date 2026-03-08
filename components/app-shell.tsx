"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Home, LayoutGrid, Scan, Settings } from "lucide-react";
import { WifiCoachLogo } from "@/components/wifi-coach-logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, walkthrough: "home-tab" },
  { href: "/scan", label: "Scan", icon: Scan, walkthrough: "scan-tab" },
  { href: "/rooms", label: "Rooms", icon: LayoutGrid, walkthrough: "rooms-tab" },
  { href: "/history", label: "History", icon: Clock, walkthrough: "history-tab" },
  { href: "/settings", label: "Settings", icon: Settings, walkthrough: "settings-tab" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/scan/run");

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-grid">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-background/72 px-5 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-lg items-center justify-between">
          <Link
            href="/"
            className="group transition-transform hover:scale-[1.01] active:scale-[0.985]"
          >
            <WifiCoachLogo size="sm" />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-32 pt-4">
        {children}
      </main>

      {!hideNav ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-background/72 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur-xl"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mx-auto flex max-w-lg items-center justify-around px-3 py-3">
            {NAV_ITEMS.map(({ href, label, icon: Icon, walkthrough }) => {
              const active = href === "/" ? pathname === "/" || pathname === "/home" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  data-walkthrough={walkthrough}
                  className={cn(
                    "group flex min-h-[56px] min-w-[58px] flex-col items-center justify-center gap-1 rounded-[20px] px-3 py-2 text-[11px] font-medium tracking-[0.01em] transition-all duration-200 active:scale-[0.97]",
                    active
                      ? "bg-white text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_8px_18px_rgba(15,23,42,0.07)]"
                      : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200 group-hover:scale-105",
                      active && "stroke-[2.5]",
                    )}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
