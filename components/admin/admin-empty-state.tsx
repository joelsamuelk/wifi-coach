"use client";

import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/wifi/app-primitives";

export function AdminEmptyState(props: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return <EmptyState {...props} />;
}
