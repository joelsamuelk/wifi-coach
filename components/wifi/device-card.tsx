"use client";

import {
  Gamepad2,
  Laptop,
  Router,
  Smartphone,
  Tablet,
  Tv,
  Wifi,
} from "lucide-react";
import { SurfaceCard } from "@/components/wifi/app-primitives";
import { cn } from "@/lib/utils";
import {
  getDeviceHeadline,
  getDeviceInterpretation,
  getDeviceTypeCopy,
} from "@/lib/devices";
import type { DiscoveredDevice } from "@/lib/devices";

function getDeviceIcon(type: DiscoveredDevice["type"]) {
  switch (type) {
    case "phone":
      return Smartphone;
    case "laptop":
      return Laptop;
    case "tv":
      return Tv;
    case "console":
      return Gamepad2;
    case "tablet":
      return Tablet;
    case "router":
      return Router;
    default:
      return Wifi;
  }
}

function getSignalTone(device: DiscoveredDevice) {
  if (device.status === "offline") {
    return "bg-muted text-muted-foreground";
  }
  if (device.signalLabel === "weak" || (device.latencyMs ?? 0) > 80) {
    return "bg-score-weak/10 text-score-weak";
  }
  if (device.signalLabel === "fair") {
    return "bg-score-fair/10 text-score-fair";
  }
  if (device.signalLabel === "excellent" || device.signalLabel === "good") {
    return "bg-score-great/10 text-score-great";
  }
  return "bg-muted text-muted-foreground";
}

export function DeviceCard({
  device,
  compact = false,
}: {
  device: DiscoveredDevice;
  compact?: boolean;
}) {
  const Icon = getDeviceIcon(device.type);
  const headline = getDeviceHeadline(device);
  const interpretation = getDeviceInterpretation(device);

  return (
    <SurfaceCard className={cn("p-4", compact && "p-4")}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{device.name}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {getDeviceTypeCopy(device.type)}
                {device.isCurrentDevice ? " • This device" : ""}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                getSignalTone(device),
              )}
            >
              {headline}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{interpretation}</p>
          {!compact ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {device.latencyMs !== null ? (
                <span className="rounded-full bg-muted px-2.5 py-1">
                  {Math.round(device.latencyMs)} ms latency
                </span>
              ) : null}
              {device.downloadMbps !== null ? (
                <span className="rounded-full bg-muted px-2.5 py-1">
                  {Math.round(device.downloadMbps)} Mbps down
                </span>
              ) : null}
              <span className="rounded-full bg-muted px-2.5 py-1 capitalize">
                {device.status}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </SurfaceCard>
  );
}
