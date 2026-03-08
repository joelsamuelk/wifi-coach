"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Cpu, RefreshCw, ScanSearch, Smartphone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardSkeleton,
  EmptyState,
  MetricTile,
  SectionHeader,
  SurfaceCard,
} from "@/components/wifi/app-primitives";
import { DeviceCard } from "@/components/wifi/device-card";
import { InlineAlert } from "@/components/wifi/inline-alert";
import { getDeviceInsightSummary, useDeviceDiscoveryStore } from "@/lib/devices";

export default function DevicesPage() {
  const support = useDeviceDiscoveryStore((state) => state.support);
  const devices = useDeviceDiscoveryStore((state) => state.devices);
  const summary = useDeviceDiscoveryStore((state) => state.summary);
  const lastScannedAt = useDeviceDiscoveryStore((state) => state.lastScannedAt);
  const isLoading = useDeviceDiscoveryStore((state) => state.isLoading);
  const error = useDeviceDiscoveryStore((state) => state.error);
  const emptyStateReason = useDeviceDiscoveryStore((state) => state.emptyStateReason);
  const refreshDevices = useDeviceDiscoveryStore((state) => state.refreshDevices);

  useEffect(() => {
    if (!lastScannedAt || Date.now() - lastScannedAt > 60_000) {
      void refreshDevices().catch(() => {});
    }
  }, [lastScannedAt, refreshDevices]);

  const unsupported = support && !support.canDiscoverDevices;
  const showLoadingState = isLoading && support === null && devices.length === 0;

  return (
    <div className="flex flex-col gap-6 pb-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-foreground">Devices</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Devices on your WiFi, shown only when this app mode can support it.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void refreshDevices()}
          disabled={isLoading}
          className="min-h-[44px] font-semibold"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {support?.discoveryMode === "mock" ? (
        <InlineAlert variant="info">
          Development mode is showing realistic mock devices. Set
          ` NEXT_PUBLIC_DEVICE_DISCOVERY_PROVIDER=mock ` to keep this enabled locally.
        </InlineAlert>
      ) : null}

      {error ? (
        <InlineAlert variant="warning">
          {error} Try refreshing again.
        </InlineAlert>
      ) : null}

      {showLoadingState ? (
        <div className="flex flex-col gap-4">
          <CardSkeleton className="h-40" />
          <CardSkeleton className="h-32" />
          <CardSkeleton className="h-32" />
        </div>
      ) : null}

      {unsupported && !showLoadingState ? (
        <EmptyState
          icon={Smartphone}
          title="Device discovery isn’t available in browser mode yet"
          description={
            emptyStateReason ??
            "You can still scan your rooms, check WiFi health, and improve weak areas."
          }
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="min-h-[48px] font-semibold">
                <Link href="/scan">
                  <ScanSearch className="mr-2 h-4 w-4" />
                  Run Room Scan
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-[48px] font-semibold">
                <Link href="/fix">Fix My WiFi</Link>
              </Button>
            </div>
          }
        />
      ) : null}

      {!unsupported && !showLoadingState ? (
        <>
          <SurfaceCard className="p-5">
            <SectionHeader
              title="Device summary"
              subtitle={getDeviceInsightSummary(devices)}
              className="mb-4"
            />
            <div className="grid grid-cols-3 gap-3">
              <MetricTile icon={Cpu} label="Total" value={summary.totalDevices} />
              <MetricTile icon={Wifi} label="Weak" value={summary.weakDevices} />
              <MetricTile icon={RefreshCw} label="Latency" value={summary.highLatencyDevices} />
            </div>
          </SurfaceCard>

          {devices.length > 0 ? (
            <div className="space-y-3">
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Cpu}
              title="No devices were returned"
              description={
                emptyStateReason ??
                "WiFi Coach could not load any device information yet. Try refreshing again."
              }
            />
          )}
        </>
      ) : null}
    </div>
  );
}
