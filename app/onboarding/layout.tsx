"use client";

import { HydrationProvider } from "@/components/hydration-provider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HydrationProvider>{children}</HydrationProvider>;
}
