"use client";

import { use } from "react";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  History,
  RefreshCw,
  Share2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeviceCard } from "@/components/wifi/device-card";
import { EmptyState, SectionHeader, SurfaceCard } from "@/components/wifi/app-primitives";
import { ProgressRing } from "@/components/wifi/progress-ring";
import { ScoreBadge } from "@/components/wifi/score-badge";
import { InlineAlert } from "@/components/wifi/inline-alert";
import { useRoomsStore, useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { getDeviceInsightSummary, useDeviceDiscoveryStore } from "@/lib/devices";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = use(params);
  const router = useRouter();
  const scans = useScanStore((state) => state.scans);
  const rooms = useRoomsStore((state) => state.rooms);
  const deviceSupport = useDeviceDiscoveryStore((state) => state.support);
  const devices = useDeviceDiscoveryStore((state) => state.devices);
  const devicesLastScannedAt = useDeviceDiscoveryStore((state) => state.lastScannedAt);
  const refreshDevices = useDeviceDiscoveryStore((state) => state.refreshDevices);

  const scanIndex = scans.findIndex((scan) => scan.id === scanId);
  const scan = scanIndex >= 0 ? scans[scanIndex] : null;
  const previousScan = scanIndex >= 0 ? scans[scanIndex + 1] ?? null : null;

  if (!scan) {
    return (
      <EmptyState
        icon={History}
        title="Scan not found"
        description="This result is no longer on this device. Open your saved history to pick another scan."
        action={
          <Button asChild variant="outline">
            <Link href="/history">Back to History</Link>
          </Button>
        }
      />
    );
  }

  const scoreDelta = previousScan ? scan.homeScore - previousScan.homeScore : null;
  const weakRooms = scan.roomResults.filter((result) => result.label === "Weak");
  const priorityDevices = useMemo(
    () =>
      devices
        .filter((device) => device.signalLabel === "weak" || (device.latencyMs ?? 0) > 80)
        .slice(0, 2),
    [devices],
  );

  useEffect(() => {
    if (!devicesLastScannedAt || Date.now() - devicesLastScannedAt > 60_000) {
      void refreshDevices().catch(() => {});
    }
  }, [devicesLastScannedAt, refreshDevices]);

  return (
    <div className="flex flex-col gap-5 pb-1">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="surface-card soft-press flex h-11 w-11 items-center justify-center rounded-2xl"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Results</h1>
          <p className="text-xs font-medium text-muted-foreground">
            {format(scan.createdAt, "EEE, d MMM • h:mm a")}
          </p>
        </div>
        <Link
          href={`/share/${scan.id}`}
          className="surface-card soft-press flex h-11 w-11 items-center justify-center rounded-2xl"
        >
          <Share2 className="h-5 w-5 text-foreground" />
        </Link>
      </div>

      <SurfaceCard className="p-6">
        <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
          Estimated Home WiFi Score
        </p>
        <div className="flex flex-col items-center gap-4">
          <ProgressRing
            value={scan.homeScore}
            label={scan.homeLabel}
            size={160}
            strokeWidth={10}
            animated
          />
          <div className="flex items-center gap-3">
            <ScoreBadge label={scan.homeLabel} />
            {scoreDelta !== null ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)]",
                  scoreDelta > 0 && "bg-score-great/10 text-score-great",
                  scoreDelta < 0 && "bg-score-weak/10 text-score-weak",
                  scoreDelta === 0 && "border-border/70 bg-muted text-muted-foreground",
                )}
              >
                {scoreDelta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : null}
                {scoreDelta < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
              </span>
            ) : null}
          </div>
          <p className="max-w-[18rem] text-center text-sm leading-6 text-muted-foreground">
            {scan.summary}
          </p>
        </div>
      </SurfaceCard>

      <InlineAlert variant="info">
        This web result is an estimate based on browser speed tests in each room, not a direct
        Wi-Fi signal scan from your device hardware.
      </InlineAlert>

      {previousScan ? (
        <InlineAlert variant={scoreDelta && scoreDelta < 0 ? "warning" : "info"}>
          {scoreDelta && scoreDelta > 0
            ? `Your home score improved by ${scoreDelta} points compared with the previous scan.`
            : scoreDelta && scoreDelta < 0
              ? `Your home score dropped by ${Math.abs(scoreDelta)} points compared with the previous scan.`
              : "Your home score is about the same as the previous scan."}
        </InlineAlert>
      ) : null}

      {deviceSupport?.canDiscoverDevices && devices.length > 0 ? (
        <SurfaceCard className="p-5">
          <SectionHeader
            title="Device insights"
            subtitle={getDeviceInsightSummary(devices)}
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/devices">View Devices</Link>
              </Button>
            }
            className="mb-4"
          />
          <div className="space-y-3">
            {(priorityDevices.length > 0 ? priorityDevices : devices.slice(0, 2)).map((device) => (
              <DeviceCard key={device.id} device={device} compact />
            ))}
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="p-5">
        <SectionHeader
          title="Room Coverage"
          subtitle="Tap a room to see its latest estimated reading and trend."
          className="mb-4"
        />
        <div className="space-y-3">
          {scan.roomResults.map((result) => {
            const room = rooms.find((entry) => entry.id === result.roomId);
            return (
              <Link key={result.roomId} href={`/rooms/${result.roomId}`}>
                <div className="surface-subtle hairline soft-press rounded-[24px] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {room?.name ?? "Unknown room"}
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{result.topIssue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[30px] font-bold leading-none tracking-tight text-foreground">
                        {result.score}
                      </p>
                      <ScoreBadge label={result.label} className="mt-1" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{result.recommendationSummary}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </SurfaceCard>

      {weakRooms.length > 0 ? (
        <SurfaceCard className="p-5">
          <SectionHeader
            title="Weak Rooms"
            subtitle="These rooms should be improved first."
            className="mb-4"
          />
          <div className="space-y-2.5">
            {weakRooms.map((result) => {
              const room = rooms.find((entry) => entry.id === result.roomId);
              return (
                <Link key={result.roomId} href={`/rooms/${result.roomId}`}>
                  <div className="soft-press flex items-center justify-between rounded-[24px] border border-score-weak/10 bg-score-weak/8 px-4 py-3.5">
                    <div>
                      <p className="font-medium text-foreground">{room?.name ?? "Unknown room"}</p>
                      <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{result.topIssue}</p>
                    </div>
                    <ScoreBadge label={result.label} />
                  </div>
                </Link>
              );
            })}
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="p-5">
        <SectionHeader
          title="What to Do Next"
          subtitle="Rules-based recommendations based on this estimated room check."
          className="mb-4"
        />
        <div className="space-y-3">
          {scan.recommendations.map((recommendation) => (
            <div
              key={`${recommendation.problem}-${recommendation.fix}`}
              className="surface-subtle hairline rounded-[24px] p-4"
            >
              <p className="text-sm font-semibold text-foreground">{recommendation.problem}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{recommendation.cause}</p>
              <div className="mt-3 rounded-2xl bg-primary/5 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">What to do</p>
                <p className="mt-1 text-sm leading-6 text-foreground">{recommendation.fix}</p>
              </div>
              <p className="mt-3 text-sm text-score-great">
                Expected improvement: {recommendation.expectedImprovement}
              </p>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <div className="grid grid-cols-3 gap-3">
        <Button asChild className="w-full min-h-[52px] font-semibold">
          <Link href="/scan">
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-check
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full min-h-[52px] font-semibold"
        >
          <Link href="/history">
            <History className="mr-2 h-4 w-4" />
            History
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full min-h-[52px] font-semibold"
        >
          <Link href={`/share/${scan.id}`}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Link>
        </Button>
      </div>
    </div>
  );
}
