"use client";

import { AppShell } from "@/components/app-shell";
import { HydrationProvider } from "@/components/hydration-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <AppShell>{children}</AppShell>
    </HydrationProvider>
  );
}
