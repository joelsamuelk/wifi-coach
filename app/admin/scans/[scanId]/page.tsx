"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Gauge, History, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminEmptyState,
  DetailPanel,
  KPIStatCard,
} from "@/components/admin";
import { SectionHeader, SurfaceCard } from "@/components/wifi/app-primitives";
import { ScoreBadge } from "@/components/wifi/score-badge";
import { useAdminData } from "@/lib/admin/useAdminData";

export default function AdminScanDetailPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = use(params);
  const { dataset } = useAdminData();
  const scanIndex = dataset.scans.findIndex((scan) => scan.id === scanId);
  const scan = scanIndex >= 0 ? dataset.scans[scanIndex] : null;
  const previous = scanIndex >= 0 ? dataset.scans[scanIndex + 1] ?? null : null;

  if (!scan) {
    return (
      <AdminEmptyState
        icon={Wifi}
        title="Scan not found"
        description="This scan is not available in the local admin dataset."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/scans">Back to Scans</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Button asChild variant="outline" size="icon-sm">
          <Link href="/admin/scans" aria-label="Back to scans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-foreground">
            Scan {scan.networkName}
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {format(scan.createdAt, "MMM d, yyyy h:mm a")} • {scan.mode} mode • {scan.id}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPIStatCard icon={Gauge} label="Home score" value={scan.homeScore} />
        <KPIStatCard icon={Wifi} label="Rooms scanned" value={scan.roomResults.length} />
        <KPIStatCard icon={History} label="Previous score" value={previous?.homeScore ?? "—"} />
        <KPIStatCard label="Status" icon={Gauge} value={<ScoreBadge label={scan.homeLabel} />} />
      </div>

      <DetailPanel title="Scan summary" subtitle={scan.summary}>
        <div className="grid gap-3 md:grid-cols-2">
          {scan.recommendations.map((recommendation) => (
            <SurfaceCard key={`${recommendation.problem}-${recommendation.fix}`} className="p-4">
              <p className="font-semibold text-foreground">{recommendation.problem}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {recommendation.cause}
              </p>
              <p className="mt-3 text-sm text-foreground">{recommendation.fix}</p>
            </SurfaceCard>
          ))}
        </div>
      </DetailPanel>

      <DetailPanel
        title="Room breakdown"
        subtitle="Full room-level issues, metrics, and recommendations."
      >
        <div className="space-y-3">
          {scan.roomResults.map((result) => {
            const room = dataset.rooms.find((entry) => entry.id === result.roomId);
            return (
              <SurfaceCard key={result.roomId} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{room?.name ?? "Unknown room"}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{result.topIssue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{result.score}</span>
                    <ScoreBadge label={result.label} />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Samples
                    </p>
                    <p className="mt-1 font-medium text-foreground">{result.samples.length}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Issues
                    </p>
                    <p className="mt-1 font-medium text-foreground">{result.issues.length}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Recommendation
                    </p>
                    <p className="mt-1 font-medium text-foreground">{result.recommendationSummary}</p>
                  </div>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      </DetailPanel>
    </div>
  );
}
