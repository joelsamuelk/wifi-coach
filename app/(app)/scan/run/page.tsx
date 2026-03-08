"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock3,
  Download,
  Hand,
  Loader2,
  MapPin,
  SkipForward,
  Upload,
  X,
} from "lucide-react";
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
import { ProgressRing } from "@/components/wifi/progress-ring";
import {
  ScanningIllustration,
  SuccessIllustration,
  WifiSignalIllustration,
} from "@/components/wifi/illustrations";
import { MetricTile, SurfaceCard } from "@/components/wifi/app-primitives";
import { InlineAlert } from "@/components/wifi/inline-alert";
import { runNetworkSample } from "@/lib/nettest";
import { getCompactLabel } from "@/lib/types";
import { useRoomsStore, useScanStore, useSettingsStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

const SAMPLE_STAGES = [
  "Testing connection",
  "Checking latency",
  "Measuring download speed",
  "Measuring upload speed",
  "Estimating room coverage",
];

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export default function ScanRunPage() {
  const router = useRouter();
  const flow = useScanStore();
  const rooms = useRoomsStore((state) => state.rooms);
  const settings = useSettingsStore();

  const [testing, setTesting] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const pollingRef = useRef<number | null>(null);

  const currentRoom = useMemo(
    () => rooms.find((room) => room.id === flow.roomIds[flow.currentRoomIndex]) ?? null,
    [flow.currentRoomIndex, flow.roomIds, rooms],
  );
  const latestResult = flow.roomResults[flow.roomResults.length - 1] ?? null;
  const samplesNeeded = flow.mode === "Quick" ? 1 : 3;
  const liveSample = flow.liveSample ?? flow.currentSamples[flow.currentSamples.length - 1] ?? null;

  useEffect(() => {
    if (flow.state === "idle") {
      router.replace("/scan");
    }
  }, [flow.state, router]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, []);

  const runSample = useCallback(async () => {
    if (testing) {
      return;
    }

    setTesting(true);
    setError(null);
    setStageIndex(0);

    const draftLiveSample = {
      latencyMs: 0,
      downloadMbps: 0,
      uploadMbps: 0,
      packetLossPct: 0,
    };
    flow.setLiveSample(draftLiveSample);

    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
    }

    pollingRef.current = window.setInterval(() => {
      const current = useScanStore.getState().liveSample;
      useScanStore.getState().setLiveSample({
        latencyMs: Math.max(8, (current?.latencyMs ?? 8) + Math.random() * 6),
        downloadMbps: Math.max(4, (current?.downloadMbps ?? 12) + Math.random() * 8),
        uploadMbps: Math.max(1, (current?.uploadMbps ?? 4) + Math.random() * 3),
        packetLossPct: Math.max(0, Math.min(4, (current?.packetLossPct ?? 0) + Math.random() * 0.4)),
      });
    }, 350);

    try {
      const samplePromise = runNetworkSample({
        pingUrl: settings.pingUrl,
        downloadUrl: settings.downloadUrl,
        uploadUrl: settings.uploadUrl,
        simulateWeak: settings.simulateWeak,
      });

      for (let index = 0; index < SAMPLE_STAGES.length; index += 1) {
        setStageIndex(index);
        await wait(index === SAMPLE_STAGES.length - 1 ? 2200 : 1800);
      }

      const sample = await samplePromise;
      flow.addSample(sample);
      flow.setLiveSample(sample);

      const completedSamples = useScanStore.getState().currentSamples.length;
      if (completedSamples >= samplesNeeded) {
        await wait(400);
        flow.finishRoom();
      }
    } catch {
      setError("The test did not finish. Retry this room or skip it for now.");
      flow.setLiveSample(null);
    } finally {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
      setTesting(false);
    }
  }, [
    flow,
    samplesNeeded,
    settings.downloadUrl,
    settings.pingUrl,
    settings.simulateWeak,
    settings.uploadUrl,
    testing,
  ]);

  useEffect(() => {
    if (flow.state === "sampling" && flow.currentSamples.length < samplesNeeded && !testing) {
      void runSample();
    }
  }, [flow.currentSamples.length, flow.state, runSample, samplesNeeded, testing]);

  async function handleViewResults() {
    const session = flow.completeScan();
    await flow.saveScan(session);
    flow.reset();
    router.push(`/results/${session.id}`);
  }

  function cancelScan() {
    flow.reset();
    router.push("/scan");
  }

  if (flow.state === "idle") {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100dvh-72px)] flex-col pb-3">
      <div className="flex items-center justify-between gap-3 pb-5">
        <button
          onClick={() => setConfirmCancel(true)}
          className="surface-card soft-press flex h-11 w-11 items-center justify-center rounded-2xl"
          aria-label="Cancel scan"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Estimated Room Check
          </p>
          <p className="text-base font-semibold tracking-tight text-foreground">
            Room {Math.min(flow.currentRoomIndex + 1, flow.roomIds.length)} of {flow.roomIds.length}
          </p>
        </div>
        <button
          onClick={() => setConfirmCancel(true)}
          className="surface-card soft-press flex h-11 w-11 items-center justify-center rounded-2xl"
          aria-label="Cancel scan"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <div className="rounded-full bg-white/55 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
      <div className="flex gap-1.5">
        {flow.roomIds.map((roomId, index) => (
          <div
            key={roomId}
            className={cn(
              "h-2.5 flex-1 rounded-full transition-all duration-500",
              index < flow.currentRoomIndex
                ? "bg-score-great"
                : index === flow.currentRoomIndex
                  ? "bg-primary"
                  : "bg-muted",
            )}
          />
        ))}
      </div>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col pb-8 pt-6">
        {flow.state === "intro" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center animate-fade-in-up">
            <WifiSignalIllustration className="w-36 h-36 animate-float" />
            <div>
              <h1 className="mb-2 text-[30px] font-bold tracking-tight text-foreground">
                Ready to Check
              </h1>
              <p className="max-w-[18rem] text-sm leading-6 text-muted-foreground">
                WiFi Coach will estimate each room using browser speed tests and explain the
                results in plain English.
              </p>
            </div>
            <SurfaceCard className="w-full p-5 text-left">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Web estimate
              </p>
              <p className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
                {flow.networkName}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {flow.mode} mode • {samplesNeeded} sample{samplesNeeded === 1 ? "" : "s"} per room
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This web app cannot read direct Wi-Fi signal strength on your device.
              </p>
            </SurfaceCard>
            <Button
              onClick={flow.goToRoomArrival}
              className="w-full min-h-[56px] text-base font-semibold"
            >
              Let&apos;s Go
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : null}

        {flow.state === "room_arrival" && currentRoom ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center animate-fade-in-up">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
              <MapPin className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="mb-2 text-[30px] font-bold tracking-tight text-foreground">
                Go to {currentRoom.name}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Stand where you normally use WiFi so we can estimate this room from browser tests.
              </p>
            </div>
            <SurfaceCard className="w-full p-5 text-left">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 shrink-0">
                  <Hand className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">What to do</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Hold your phone where you usually browse, stream, or take calls for the most
                    useful reading.
                  </p>
                </div>
              </div>
            </SurfaceCard>
            <div className="flex w-full flex-col gap-3 pt-2">
              <Button
                onClick={flow.startSampling}
                className="w-full min-h-[56px] text-base font-semibold"
              >
                I&apos;m Here
                <CheckCircle className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={flow.skipRoom}
                className="min-h-[48px] rounded-2xl text-muted-foreground"
              >
                <SkipForward className="mr-1.5 h-4 w-4" />
                Skip This Room
              </Button>
            </div>
          </div>
        ) : null}

        {flow.state === "sampling" && currentRoom ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center animate-fade-in">
            <ScanningIllustration className="w-40 h-40" />
            <div>
              <h2 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
                Testing {currentRoom.name}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Sample {Math.min(flow.currentSamples.length + 1, samplesNeeded)} of {samplesNeeded}
              </p>
            </div>

            <SurfaceCard className="w-full p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="text-left">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Current step
                  </p>
                  <p className="mt-1.5 text-base font-semibold tracking-tight text-foreground">
                    {SAMPLE_STAGES[stageIndex]}
                  </p>
                </div>
                <div className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                  {Math.min(flow.currentSamples.length + 1, samplesNeeded)}/{samplesNeeded}
                </div>
              </div>
              <p className="mt-2 text-left text-sm leading-6 text-muted-foreground">
                This takes about {flow.mode === "Quick" ? "20 seconds" : "20 seconds per sample"}.
                The result is an estimate from this browser, not a direct signal reading.
              </p>
              <div className="mt-5 space-y-3">
                {SAMPLE_STAGES.map((label, index) => (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-2.5 flex-1 rounded-full",
                        index < stageIndex
                          ? "bg-score-great"
                          : index === stageIndex
                            ? "bg-primary"
                            : "bg-muted",
                      )}
                    />
                    <span
                      className={cn(
                        "w-28 text-right text-xs font-medium",
                        index <= stageIndex ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            {liveSample ? (
              <div className="grid w-full grid-cols-3 gap-3">
                <LiveMetric icon={Download} label="Download" value={Math.round(liveSample.downloadMbps ?? 0)} unit="Mbps" />
                <LiveMetric icon={Upload} label="Upload" value={Math.round(liveSample.uploadMbps ?? 0)} unit="Mbps" />
                <LiveMetric icon={Clock3} label="Latency" value={Math.round(liveSample.latencyMs ?? 0)} unit="ms" />
              </div>
            ) : null}

            {testing ? (
              <div className="surface-card flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Running test...
              </div>
            ) : null}

            {error ? (
              <div className="w-full space-y-3">
                <InlineAlert variant="warning">{error}</InlineAlert>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => void runSample()} className="min-h-[48px]">
                    Retry
                  </Button>
                  <Button variant="ghost" onClick={flow.skipRoom} className="min-h-[48px] text-muted-foreground">
                    Skip Room
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {flow.state === "room_preview" && latestResult ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center animate-fade-in-up">
            <SurfaceCard className="w-full p-6">
              <p className="mb-3 text-sm text-muted-foreground">{currentRoom?.name ?? "Room result"}</p>
              <div className="mb-5 flex items-center justify-center gap-6">
                <ProgressRing
                  value={latestResult.score}
                  label={latestResult.label}
                  size={120}
                  strokeWidth={8}
                  showLabel={false}
                />
                <div className="text-left">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Estimated room score
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      (latestResult.label === "Excellent" || latestResult.label === "Good") &&
                        "text-score-great",
                      latestResult.label === "Fair" && "text-score-fair",
                      latestResult.label === "Weak" && "text-score-weak",
                    )}
                  >
                    {getCompactLabel(latestResult.label)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {latestResult.recommendationSummary}
                  </p>
                </div>
              </div>

              {latestResult.samples.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                  <LiveMetric
                    icon={Download}
                    label="Download"
                    value={Math.round(
                      latestResult.samples.reduce((total, sample) => total + sample.downloadMbps, 0) /
                        latestResult.samples.length,
                    )}
                    unit="Mbps"
                  />
                  <LiveMetric
                    icon={Upload}
                    label="Upload"
                    value={Math.round(
                      latestResult.samples.reduce((total, sample) => total + sample.uploadMbps, 0) /
                        latestResult.samples.length,
                    )}
                    unit="Mbps"
                  />
                  <LiveMetric
                    icon={Clock3}
                    label="Latency"
                    value={Math.round(
                      latestResult.samples.reduce((total, sample) => total + sample.latencyMs, 0) /
                        latestResult.samples.length,
                    )}
                    unit="ms"
                  />
                </div>
              ) : null}
            </SurfaceCard>

            <InlineAlert variant={latestResult.label === "Weak" ? "warning" : "info"}>
              {latestResult.topIssue}
            </InlineAlert>

            <Button
              onClick={flow.nextRoom}
              className="w-full min-h-[56px] text-base font-semibold"
            >
              {flow.currentRoomIndex + 1 >= flow.roomIds.length ? "Finish Check" : "Next Room"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : null}

        {flow.state === "complete" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center animate-fade-in-up">
            <SuccessIllustration className="w-32 h-32" />
            <div>
              <h2 className="mb-2 text-[30px] font-bold tracking-tight text-foreground">
                Room Check Complete
              </h2>
              <p className="max-w-[18rem] text-sm leading-6 text-muted-foreground">
                All selected rooms were estimated. View your results to see what is wrong, why it
                may be happening, and what to do next.
              </p>
            </div>
            <div className="w-full grid grid-cols-3 gap-2.5">
              {flow.roomResults.map((result) => {
                const room = rooms.find((entry) => entry.id === result.roomId);
                return (
                  <div key={result.roomId} className="surface-card rounded-[22px] p-3 text-center">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full mx-auto mb-2",
                        (result.label === "Excellent" || result.label === "Good") &&
                          "bg-score-great",
                        result.label === "Fair" && "bg-score-fair",
                        result.label === "Weak" && "bg-score-weak",
                      )}
                    />
                    <p className="text-xs font-medium text-foreground truncate">{room?.name}</p>
                    <p className="text-xs text-muted-foreground">{result.score}/100</p>
                  </div>
                );
              })}
            </div>
            <Button
              onClick={() => void handleViewResults()}
              className="w-full min-h-[56px] text-base font-semibold"
            >
              View Results
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : null}
      </div>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this room check?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current room progress will be lost. Saved scans in history will stay untouched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Checking</AlertDialogCancel>
            <AlertDialogAction onClick={cancelScan}>Cancel Check</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LiveMetric({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Download;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <MetricTile
      icon={Icon}
      label={label}
      value={value}
      detail={unit}
      className="text-center"
    />
  );
}
