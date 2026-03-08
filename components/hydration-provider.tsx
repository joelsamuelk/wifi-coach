"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { WalkthroughProvider } from "@/components/walkthrough";
import { CardSkeleton, PageHeaderSkeleton } from "@/components/wifi/app-primitives";
import { WifiCoachLogoAnimated } from "@/components/wifi-coach-logo";
import {
  useDiagnosticsStore,
  useOnboardingStore,
  useRoomsStore,
  useScanStore,
  useSettingsStore,
} from "@/lib/stores";

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const roomsLoaded = useRoomsStore((state) => state.loaded);
  const scansLoaded = useScanStore((state) => state.loaded);
  const settingsLoaded = useSettingsStore((state) => state.loaded);
  const diagnosticsLoaded = useDiagnosticsStore((state) => state.loaded);
  const onboardingCompleted = useOnboardingStore((state) => state.completed);
  const onboardingHydrated = useOnboardingStore((state) => state.hydrated);

  const isAuthRoute = pathname?.startsWith("/auth");

  useEffect(() => {
    async function init() {
      useOnboardingStore.getState().hydrate();
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

  useEffect(() => {
    if (
      ready &&
      onboardingHydrated &&
      !onboardingCompleted &&
      !isAuthRoute &&
      pathname !== "/onboarding"
    ) {
      router.replace("/onboarding");
    }
  }, [isAuthRoute, onboardingCompleted, onboardingHydrated, pathname, ready, router]);

  if (isAuthRoute) {
    return <WalkthroughProvider>{children}</WalkthroughProvider>;
  }

  if (!ready || !roomsLoaded || !scansLoaded || !settingsLoaded || !diagnosticsLoaded || !onboardingHydrated) {
    return (
      <div className="flex min-h-dvh flex-col bg-background bg-grid">
        <div className="sticky top-0 z-40 border-b border-white/60 bg-background/72 px-5 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-lg items-center">
            <WifiCoachLogoAnimated size="sm" />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-5 pb-32 pt-4">
          <PageHeaderSkeleton />
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-56" />
          <div className="grid grid-cols-2 gap-4">
            <CardSkeleton className="h-36" />
            <CardSkeleton className="h-36" />
          </div>
        </div>
      </div>
    );
  }

  if (!onboardingCompleted && pathname !== "/onboarding") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <WifiCoachLogoAnimated size="lg" />
      </div>
    );
  }

  return <WalkthroughProvider>{children}</WalkthroughProvider>;
}
