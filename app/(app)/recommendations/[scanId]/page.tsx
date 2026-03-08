"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Lightbulb, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRoomsStore, useScanStore } from "@/lib/stores";

export default function RecommendationsPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = use(params);
  const router = useRouter();
  const scan = useScanStore((state) => state.scans.find((entry) => entry.id === scanId) ?? null);
  const rooms = useRoomsStore((state) => state.rooms);

  if (!scan) {
    return (
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <p className="text-muted-foreground">Scan not found.</p>
        <Button asChild variant="outline">
          <Link href="/history">Back to History</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-card card-shadow"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Action Plan</h1>
          <p className="text-xs text-muted-foreground">Practical steps from your latest scan</p>
        </div>
      </div>

      <section className="bg-card rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Home-wide recommendations</h2>
            <p className="text-sm text-muted-foreground">
              Start with the changes that help the whole home.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {scan.recommendations.map((recommendation) => (
            <div key={`${recommendation.problem}-${recommendation.fix}`} className="rounded-2xl bg-muted/40 p-4">
              <p className="font-semibold text-foreground">{recommendation.problem}</p>
              <p className="text-sm text-muted-foreground mt-1">{recommendation.cause}</p>
              <p className="text-sm text-foreground mt-3">{recommendation.fix}</p>
              <p className="text-sm text-score-great mt-3">
                Expected improvement: {recommendation.expectedImprovement}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card rounded-2xl p-5 card-shadow">
        <h2 className="font-semibold text-foreground">Room-by-room notes</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          These notes explain what to change in each room that needs attention.
        </p>
        <div className="space-y-3">
          {scan.roomResults.map((result) => {
            const room = rooms.find((entry) => entry.id === result.roomId);
            return (
              <div key={result.roomId} className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-foreground">{room?.name ?? "Unknown room"}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{result.topIssue}</p>
                <div className="space-y-2">
                  {result.recommendations.map((recommendation) => (
                    <div key={`${recommendation.problem}-${recommendation.fix}`} className="rounded-xl bg-background px-3 py-3">
                      <p className="text-sm font-medium text-foreground">{recommendation.fix}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Expected improvement: {recommendation.expectedImprovement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
