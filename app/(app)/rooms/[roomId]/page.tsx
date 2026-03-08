"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, SectionHeader, SurfaceCard } from "@/components/wifi/app-primitives";
import { ProgressRing } from "@/components/wifi/progress-ring";
import { ScoreBadge } from "@/components/wifi/score-badge";
import { StatPill } from "@/components/wifi/stat-pill";
import { InlineAlert } from "@/components/wifi/inline-alert";
import { useRoomsStore, useScanStore } from "@/lib/stores";

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const rooms = useRoomsStore((state) => state.rooms);
  const scans = useScanStore((state) => state.scans);

  const room = rooms.find((entry) => entry.id === roomId) ?? null;
  const roomHistory = scans
    .map((scan) => ({
      scanId: scan.id,
      createdAt: scan.createdAt,
      result: scan.roomResults.find((entry) => entry.roomId === roomId) ?? null,
    }))
    .filter((entry) => entry.result !== null)
    .map((entry) => ({
      scanId: entry.scanId,
      createdAt: entry.createdAt,
      result: entry.result!,
    }));

  const latest = roomHistory[0] ?? null;
  const previous = roomHistory[1] ?? null;
  const delta = latest && previous ? latest.result.score - previous.result.score : null;

  if (!room) {
    return (
      <EmptyState
        icon={TrendingDown}
        title="Room not found"
        description="This room is no longer in your saved list."
        action={
          <Button asChild variant="outline">
            <Link href="/rooms">Back to Rooms</Link>
          </Button>
        }
      />
    );
  }

  if (!latest) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon-sm"
            className="rounded-lg bg-card card-shadow"
          >
            <Link href="/rooms" aria-label="Back">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{room.name}</h1>
            <p className="text-xs font-medium text-muted-foreground">
              {room.floor} · {room.type}
            </p>
          </div>
        </div>
        <EmptyState
          icon={RefreshCw}
          title="No scan history yet"
          description="Run a room check here to see its latest estimated score and trend."
          action={
            <Button asChild className="min-h-[48px] font-semibold">
              <Link href={`/scan?roomId=${room.id}`}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-check This Room
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const avgLatency = Math.round(average(latest.result.samples.map((sample) => sample.latencyMs)));
  const avgDownload = Math.round(
    average(latest.result.samples.map((sample) => sample.downloadMbps)),
  );
  const avgUpload = Math.round(average(latest.result.samples.map((sample) => sample.uploadMbps)));
  const avgPacketLoss = average(latest.result.samples.map((sample) => sample.packetLossPct)).toFixed(1);

  return (
    <div className="flex flex-col gap-4 pb-1">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="icon-sm"
          className="rounded-lg bg-card card-shadow"
        >
          <Link href="/rooms" aria-label="Back">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{room.name}</h1>
          <p className="text-xs font-medium text-muted-foreground">
            {room.floor} · {room.type}
          </p>
        </div>
      </div>

      <SurfaceCard className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Latest room score</p>
            <p className="mt-1 text-[40px] font-bold leading-none tracking-tight text-foreground">
              {latest.result.score}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <ScoreBadge label={latest.result.label} />
              {delta !== null ? (
                <span
                  className={delta >= 0 ? "text-score-great text-sm font-medium" : "text-score-weak text-sm font-medium"}
                >
                  {delta >= 0 ? "+" : ""}
                  {delta} vs previous
                </span>
              ) : null}
            </div>
          </div>
          <ProgressRing
            value={latest.result.score}
            label={latest.result.label}
            size={118}
            strokeWidth={8}
          />
        </div>
      </SurfaceCard>

      <div className="grid grid-cols-2 gap-3">
        <StatPill label="Latency" value={`${avgLatency}ms`} />
        <StatPill label="Download" value={`${avgDownload} Mbps`} />
        <StatPill label="Upload" value={`${avgUpload} Mbps`} />
        <StatPill label="Packet Loss" value={`${avgPacketLoss}%`} />
      </div>

      <InlineAlert variant={latest.result.label === "Weak" ? "warning" : "info"}>
        {latest.result.topIssue}
      </InlineAlert>

      <SurfaceCard className="p-5">
        <SectionHeader
          title="Recommended Fix"
          subtitle={latest.result.recommendations[0]?.cause ?? "No issue detected in this room."}
          className="mb-4"
        />
        <div className="rounded-[24px] bg-primary/5 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">What to do next</p>
          <p className="mt-1 text-sm leading-6 text-foreground">
            {latest.result.recommendations[0]?.fix ??
              "Keep your setup as it is and re-scan after any router changes."}
          </p>
          <p className="mt-3 text-sm text-score-great">
            Expected improvement:{" "}
            {latest.result.recommendations[0]?.expectedImprovement ??
              "You should maintain strong coverage here."}
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-5">
        <SectionHeader
          title="Room Trend"
          subtitle="Recent results for this room."
          className="mb-4"
        />
        <div className="space-y-3">
          {roomHistory.map((entry, index) => {
            const previousEntry = roomHistory[index + 1];
            const trend = previousEntry ? entry.result.score - previousEntry.result.score : null;

            return (
              <Link key={entry.scanId} href={`/results/${entry.scanId}`}>
                <div className="surface-subtle hairline soft-press flex items-center justify-between rounded-[24px] px-4 py-3.5">
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">{entry.result.topIssue}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-2xl font-bold leading-none tracking-tight text-foreground">
                        {entry.result.score}
                      </span>
                      <ScoreBadge label={entry.result.label} />
                    </div>
                    {trend !== null ? (
                      <div
                        className={
                          trend >= 0
                            ? "mt-1 inline-flex items-center gap-1 text-xs font-medium text-score-great"
                            : "mt-1 inline-flex items-center gap-1 text-xs font-medium text-score-weak"
                        }
                      >
                        {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {trend >= 0 ? `+${trend}` : trend}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </SurfaceCard>

      <Button asChild className="w-full min-h-[52px] font-semibold">
        <Link href={`/scan?roomId=${room.id}`}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Re-check This Room
        </Link>
      </Button>
    </div>
  );
}
