"use client";

import { useEffect, useState } from "react";
import { CardSkeleton, PageHeaderSkeleton } from "@/components/wifi/app-primitives";
import { WifiCoachLogoAnimated } from "@/components/wifi-coach-logo";
import {
  useDiagnosticsStore,
  useRoomsStore,
  useScanStore,
  useSettingsStore,
} from "@/lib/stores";

export function AdminHydrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const roomsLoaded = useRoomsStore((state) => state.loaded);
  const scansLoaded = useScanStore((state) => state.loaded);
  const settingsLoaded = useSettingsStore((state) => state.loaded);
  const diagnosticsLoaded = useDiagnosticsStore((state) => state.loaded);

  useEffect(() => {
    async function init() {
      await Promise.all([
        useRoomsStore.getState().hydrate(),
        useScanStore.getState().hydrate(),
        useSettingsStore.getState().hydrate(),
        useDiagnosticsStore.getState().hydrate(),
      ]);
      setReady(true);
    }

    void init();
  }, []);

  if (!ready || !roomsLoaded || !scansLoaded || !settingsLoaded || !diagnosticsLoaded) {
    return (
      <div className="flex min-h-dvh flex-col bg-background bg-grid">
        <div className="border-b border-white/60 bg-background/80 px-6 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center">
            <WifiCoachLogoAnimated size="sm" />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-6 py-6">
          <PageHeaderSkeleton />
          <div className="grid gap-4 md:grid-cols-4">
            <CardSkeleton className="h-28" />
            <CardSkeleton className="h-28" />
            <CardSkeleton className="h-28" />
            <CardSkeleton className="h-28" />
          </div>
          <CardSkeleton className="h-72" />
          <CardSkeleton className="h-72" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
