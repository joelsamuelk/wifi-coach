"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, Scan, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState, SurfaceCard } from "@/components/wifi/app-primitives";
import { ScoreBadge } from "@/components/wifi/score-badge";
import { useScanStore } from "@/lib/stores";

export default function HistoryPage() {
  const router = useRouter();
  const scans = useScanStore((state) => state.scans);
  const deleteScan = useScanStore((state) => state.deleteScan);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 pb-1">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-foreground">Scan History</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {scans.length} saved scan{scans.length === 1 ? "" : "s"} on this device
        </p>
      </div>

      {scans.length === 0 ? (
        <EmptyState
          icon={Clock3}
          title="No scans yet"
          description="Run your first room-by-room scan to start tracking your WiFi."
          action={
            <Button asChild className="min-h-[48px] font-semibold">
              <Link href="/scan">
                <Scan className="mr-2 h-4 w-4" />
                Start Scan
              </Link>
            </Button>
          }
        />
      ) : (
        <SurfaceCard className="overflow-hidden p-0">
          {scans.map((scan, index) => {
            const previous = scans[index + 1] ?? null;
            const delta = previous ? scan.homeScore - previous.homeScore : null;

            return (
              <div
                key={scan.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/results/${scan.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/results/${scan.id}`);
                  }
                }}
                className="flex cursor-pointer items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/30 first:rounded-t-[28px] last:rounded-b-[28px]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                  <Scan className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{scan.networkName}</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {new Date(scan.createdAt).toLocaleString()} · {scan.mode} ·{" "}
                    {scan.roomResults.length} room{scan.roomResults.length === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{scan.summary}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-2xl font-bold leading-none tracking-tight text-foreground">
                      {scan.homeScore}
                    </span>
                    <ScoreBadge label={scan.homeLabel} />
                  </div>
                  {delta !== null ? (
                    <div
                      className={
                        delta >= 0
                          ? "mt-1 inline-flex items-center gap-1 text-xs font-medium text-score-great"
                          : "mt-1 inline-flex items-center gap-1 text-xs font-medium text-score-weak"
                      }
                    >
                      {delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {delta >= 0 ? `+${delta}` : delta}
                    </div>
                  ) : null}
                </div>
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setPendingDelete(scan.id);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Delete scan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </SurfaceCard>
      )}

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this scan?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the saved result from history on this device only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Scan</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => (pendingDelete ? deleteScan(pendingDelete) : Promise.resolve())}
            >
              Delete Scan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
