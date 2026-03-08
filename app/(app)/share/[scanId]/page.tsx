"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Download, Share2, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoomsStore, useScanStore } from "@/lib/stores";
import { getStatusLabel } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SharePage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = use(params);
  const router = useRouter();
  const scans = useScanStore((state) => state.scans);
  const rooms = useRoomsStore((state) => state.rooms);

  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const scan = scans.find((entry) => entry.id === scanId) ?? null;

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

  const shareScan = scan;

  const status = getStatusLabel(scan.homeLabel);
  const summaryText = [
    `My Home WiFi Score: ${scan.homeScore}/100`,
    `Status: ${status}`,
    `Network: ${scan.networkName}`,
    `Summary: ${scan.summary}`,
    "Shared from WiFi Coach",
  ].join("\n");

  async function handleShare() {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Home WiFi Score",
          text: summaryText,
        });
      } else {
        await navigator.clipboard.writeText(summaryText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setSharing(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    // Lightweight MVP fallback. A real image export can be added later without changing the share text flow.
    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wifi-coach-score-${new Date(shareScan.createdAt).toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
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
          <h1 className="text-xl font-bold text-foreground tracking-tight">Share Results</h1>
          <p className="text-xs text-muted-foreground">Send a simple WiFi score summary</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl p-6 card-shadow relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-40 h-40 rounded-full border-8 border-white/30" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border-8 border-white/20" />
        </div>

        <div className="relative text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/80">WiFi Coach</span>
          </div>

          <p className="text-sm text-white/70 mb-2">My Home WiFi Score</p>
          <div className="flex items-baseline justify-center gap-1 mb-3">
            <span className="text-6xl font-bold text-white">{shareScan.homeScore}</span>
            <span className="text-2xl text-white/70">/ 100</span>
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 text-white">
            {status}
          </span>

          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-white font-medium">{shareScan.summary}</p>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {shareScan.roomResults.slice(0, 3).map((result) => {
                const room = rooms.find((entry) => entry.id === result.roomId);
                return (
                  <div key={result.roomId} className="text-center">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full mx-auto mb-1",
                        (result.label === "Excellent" || result.label === "Good") &&
                          "bg-score-great",
                        result.label === "Fair" && "bg-score-fair",
                        result.label === "Weak" && "bg-score-weak",
                      )}
                    />
                    <p className="text-xs text-white/80 truncate">{room?.name ?? "Room"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => void handleShare()}
          disabled={sharing}
          className="w-full min-h-[56px] text-base font-semibold rounded-2xl"
        >
          <Share2 className="mr-2 h-5 w-5" />
          {sharing ? "Sharing..." : "Share"}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="min-h-[52px] rounded-xl font-semibold"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleCopy()}
            className="min-h-[52px] rounded-xl font-semibold"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-score-great" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
