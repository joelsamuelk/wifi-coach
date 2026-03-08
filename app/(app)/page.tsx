"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Clock3,
  Download,
  Home,
  MapPin,
  Upload,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MetricTile,
  SectionHeader,
  SurfaceCard,
} from "@/components/wifi/app-primitives";
import { ProgressRing } from "@/components/wifi/progress-ring";
import { ScoreBadge } from "@/components/wifi/score-badge";
import { useDiagnosticsStore, useRoomsStore, useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/types";
import { useWifiNetworkStore } from "@/lib/wifi";
import { getConnectedWifiLabel, getWifiAccessExplanation } from "@/lib/wifi/ui";

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export default function HomePage() {
  const rooms = useRoomsStore((state) => state.rooms);
  const latestDiagnostic = useDiagnosticsStore((state) => state.latestDiagnostic);
  const latestScan = useScanStore((state) => state.scans[0] ?? null);
  const currentConnection = useWifiNetworkStore((state) => state.currentConnection);
  const availableNetworks = useWifiNetworkStore((state) => state.availableNetworks);
  const lastScannedAt = useWifiNetworkStore((state) => state.lastScannedAt);
  const platformSupport = useWifiNetworkStore((state) => state.platformSupport);
  const wifiError = useWifiNetworkStore((state) => state.error);
  const isWifiLoading = useWifiNetworkStore((state) => state.isLoading);
  const refreshWifiSnapshot = useWifiNetworkStore((state) => state.refreshWifiSnapshot);

  useEffect(() => {
    if (!lastScannedAt || Date.now() - lastScannedAt > 30_000) {
      void refreshWifiSnapshot();
    }
  }, [lastScannedAt, refreshWifiSnapshot]);

  const latestScanMetrics = latestScan
    ? {
        latencyMs: Math.round(
          average(
            latestScan.roomResults.flatMap((result) =>
              result.samples.map((sample) => sample.latencyMs),
            ),
          ),
        ),
        downloadMbps: Math.round(
          average(
            latestScan.roomResults.flatMap((result) =>
              result.samples.map((sample) => sample.downloadMbps),
            ),
          ),
        ),
        uploadMbps: Math.round(
          average(
            latestScan.roomResults.flatMap((result) =>
              result.samples.map((sample) => sample.uploadMbps),
            ),
          ),
        ),
      }
    : null;

  const latestStatus = latestDiagnostic
    ? {
        label: latestDiagnostic.status,
        summary: latestDiagnostic.problem,
        subcopy: latestDiagnostic.fix,
        updatedAt: latestDiagnostic.createdAt,
        latencyMs: latestDiagnostic.latencyMs,
        downloadMbps: latestDiagnostic.downloadMbps,
        uploadMbps: latestDiagnostic.uploadMbps,
      }
    : latestScan
      ? {
          label: getStatusLabel(latestScan.homeLabel),
          summary: latestScan.summary,
          subcopy: latestScan.recommendations[0]?.fix ?? "Run another scan after making changes.",
          updatedAt: latestScan.createdAt,
          latencyMs: latestScanMetrics?.latencyMs ?? 0,
          downloadMbps: latestScanMetrics?.downloadMbps ?? 0,
          uploadMbps: latestScanMetrics?.uploadMbps ?? 0,
        }
      : null;

  const weakRooms = latestScan?.roomResults.filter((result) => result.label === "Weak") ?? [];

  return (
    <div className="flex flex-col gap-6 pb-1">
      <Link href="/fix" data-walkthrough="fix-wifi" className="block soft-press">
        <div className="relative overflow-hidden rounded-[30px] border border-white/20 bg-gradient-to-br from-primary via-primary to-sky-500 px-6 py-6 shadow-[0_20px_40px_rgba(37,99,235,0.24)] transition-transform duration-200 hover:-translate-y-0.5">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-4 right-4 h-32 w-32 rounded-full border-8 border-white/25" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full border-8 border-white/15" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/25" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/18">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-primary-foreground/82">
                  Quick Diagnostic
                </span>
              </div>
              <h1 className="mb-2 text-[28px] font-bold tracking-tight text-primary-foreground">
                Fix My WiFi
              </h1>
              <p className="max-w-[16rem] text-sm leading-6 text-primary-foreground/78">
                {latestDiagnostic
                  ? `${latestDiagnostic.problem}. ${latestDiagnostic.fix}`
                  : "Run a quick check to see what is wrong and what to do next."}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white/18 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)] transition-transform duration-200 group-hover:scale-105">
              <ArrowRight className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </Link>

      <SurfaceCard className="p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <SectionHeader
            title="WiFi Status"
            subtitle={
              latestStatus
                ? "Plain-English summary of your latest WiFi check."
                : "Run a scan to see your WiFi stats."
            }
          />
          <span
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.02em] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)]",
              latestStatus?.label === "Great WiFi" && "bg-score-great/10 text-score-great",
              latestStatus?.label === "Fair Coverage" && "bg-score-fair/10 text-score-fair",
              latestStatus?.label === "Weak Signal" && "bg-score-weak/10 text-score-weak",
              !latestStatus && "border-border/70 bg-muted text-muted-foreground",
            )}
          >
            {latestStatus?.label ?? "Not tested yet"}
          </span>
        </div>

        {latestStatus ? (
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                {latestStatus.summary}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {latestStatus.subcopy}
              </p>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                Updated {formatDistanceToNow(latestStatus.updatedAt, { addSuffix: true })}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard icon={Download} label="Download" value={`${latestStatus.downloadMbps}`} unit="Mbps" />
              <MetricCard icon={Upload} label="Upload" value={`${latestStatus.uploadMbps}`} unit="Mbps" />
              <MetricCard icon={Clock3} label="Latency" value={`${latestStatus.latencyMs}`} unit="ms" />
            </div>
            <div className="surface-subtle hairline rounded-[24px] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Connected Wi-Fi
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground">
                    {getConnectedWifiLabel(currentConnection, platformSupport)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {platformSupport?.canScanNearbyNetworks
                      ? `Nearby networks: ${availableNetworks.length}`
                      : getWifiAccessExplanation(platformSupport)}
                  </p>
                  {wifiError ? (
                    <p className="text-xs text-score-weak mt-2">{wifiError}</p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refreshWifiSnapshot()}
                  disabled={isWifiLoading}
                  className="min-h-[40px]"
                >
                  {isWifiLoading ? "Refreshing..." : "Refresh network"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold tracking-tight text-foreground">Not tested yet</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Run a scan to see your WiFi stats.
                </p>
              </div>
            </div>
            <div className="surface-subtle hairline rounded-[24px] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Connected Wi-Fi
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground">
                    {getConnectedWifiLabel(currentConnection, platformSupport)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {platformSupport?.canScanNearbyNetworks
                      ? `Nearby networks: ${availableNetworks.length}`
                      : getWifiAccessExplanation(platformSupport)}
                  </p>
                  {wifiError ? (
                    <p className="text-xs text-score-weak mt-2">{wifiError}</p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refreshWifiSnapshot()}
                  disabled={isWifiLoading}
                  className="min-h-[40px]"
                >
                  {isWifiLoading ? "Refreshing..." : "Refresh network"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="p-5">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            title="Ready to Scan"
            subtitle={
              rooms.length > 0
                ? `${rooms.length} room${rooms.length === 1 ? "" : "s"} configured for guided scanning.`
                : "Add your rooms first so WiFi Coach can guide you room by room."
            }
          />
          {latestScan ? (
            <ProgressRing
              value={latestScan.homeScore}
              label={latestScan.homeLabel}
              size={88}
              strokeWidth={7}
              showLabel={false}
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-primary/10">
              <Home className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>

        {latestScan ? (
          <div className="surface-subtle hairline mt-5 flex items-center justify-between rounded-[24px] px-4 py-3.5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Latest home score
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[32px] font-bold leading-none tracking-tight text-foreground">
                  {latestScan.homeScore}
                </span>
                <ScoreBadge label={latestScan.homeLabel} />
              </div>
            </div>
            <Button asChild variant="outline" className="min-h-[44px]">
              <Link href={`/results/${latestScan.id}`}>
                View Results
              </Link>
            </Button>
          </div>
        ) : null}

        <div className="mt-4">
          <Button
            asChild
            className="w-full min-h-[52px] rounded-2xl text-base font-semibold"
          >
            <Link href={rooms.length > 0 ? "/scan" : "/rooms"}>
              {rooms.length > 0 ? "Start Scan" : "Add Rooms"}
            </Link>
          </Button>
        </div>
      </SurfaceCard>

      {weakRooms.length > 0 ? (
        <SurfaceCard className="p-5">
          <SectionHeader
            title="Rooms to Improve First"
            subtitle="Focus on the rooms with the weakest signal first."
            className="mb-4"
          />
          <div className="space-y-2.5">
            {weakRooms.slice(0, 3).map((result) => {
              const room = rooms.find((entry) => entry.id === result.roomId);
              return (
                <Link key={result.roomId} href={`/rooms/${result.roomId}`}>
                  <div className="surface-subtle hairline soft-press flex items-center justify-between rounded-[24px] px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-score-weak/10">
                        <MapPin className="h-5 w-5 text-score-weak" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{room?.name ?? "Unknown room"}</p>
                        <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{result.topIssue}</p>
                      </div>
                    </div>
                    <ScoreBadge label={result.label} />
                  </div>
                </Link>
              );
            })}
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Download;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <MetricTile
      icon={Icon}
      label={label}
      value={
        <span>
          {value}
          <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>
        </span>
      }
    />
  );
}
