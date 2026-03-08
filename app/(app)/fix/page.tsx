"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Download,
  Upload,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricTile, SurfaceCard } from "@/components/wifi/app-primitives";
import { InlineAlert } from "@/components/wifi/inline-alert";
import {
  ScanningIllustration,
  SuccessIllustration,
} from "@/components/wifi/illustrations";
import {
  testConnection,
  testDownloadSpeed,
  testLatency,
  testUploadSpeed,
} from "@/lib/nettest";
import { useDiagnosticsStore, useScanStore, useSettingsStore } from "@/lib/stores";
import type { QuickDiagnosticResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type FixStep = "ready" | "testing" | "results";

const TEST_STAGES = [
  { text: "Testing connection", durationMs: 3200, icon: Wifi },
  { text: "Checking latency", durationMs: 3600, icon: Clock3 },
  { text: "Measuring download speed", durationMs: 4600, icon: Download },
  { text: "Measuring upload speed", durationMs: 4200, icon: Upload },
  { text: "Analysing WiFi health", durationMs: 2800, icon: Activity },
] as const;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export default function FixPage() {
  const router = useRouter();
  const settings = useSettingsStore();
  const saveDiagnostic = useDiagnosticsStore((state) => state.saveDiagnostic);
  const scans = useScanStore((state) => state.scans);

  const [step, setStep] = useState<FixStep>("ready");
  const [currentStage, setCurrentStage] = useState(0);
  const [result, setResult] = useState<QuickDiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const latestScan = scans[0] ?? null;
  const weakRooms = latestScan?.roomResults.filter((room) => room.label === "Weak").length ?? 0;

  useEffect(() => {
    if (step !== "testing") {
      return;
    }

    let cancelled = false;

    async function runDiagnostic() {
      try {
        setError(null);

        setCurrentStage(0);
        const connectionCheck = Promise.all([
          testConnection(settings.pingUrl),
          wait(TEST_STAGES[0].durationMs),
        ]);
        await connectionCheck;

        setCurrentStage(1);
        const [latency] = await Promise.all([
          testLatency(settings.pingUrl, settings.simulateWeak),
          wait(TEST_STAGES[1].durationMs),
        ]);

        setCurrentStage(2);
        const [downloadMbps] = await Promise.all([
          testDownloadSpeed(settings.downloadUrl, settings.simulateWeak),
          wait(TEST_STAGES[2].durationMs),
        ]);

        setCurrentStage(3);
        const [uploadMbps] = await Promise.all([
          testUploadSpeed(settings.uploadUrl, settings.simulateWeak),
          wait(TEST_STAGES[3].durationMs),
        ]);

        setCurrentStage(4);
        await wait(TEST_STAGES[4].durationMs);

        if (cancelled) {
          return;
        }

        const diagnostic = buildDiagnosticResult({
          latencyMs: latency.latencyMs,
          downloadMbps,
          uploadMbps,
          packetLossPct: latency.packetLossPct,
          weakRooms,
        });
        setResult(diagnostic);
        await saveDiagnostic(diagnostic);
        setStep("results");
      } catch {
        if (!cancelled) {
          setError("The quick diagnostic could not finish. Check your settings and try again.");
          setStep("ready");
        }
      }
    }

    void runDiagnostic();
    return () => {
      cancelled = true;
    };
  }, [
    saveDiagnostic,
    settings.downloadUrl,
    settings.pingUrl,
    settings.simulateWeak,
    settings.uploadUrl,
    step,
    weakRooms,
  ]);

  const currentStageText = useMemo(
    () => TEST_STAGES[currentStage]?.text ?? TEST_STAGES[0].text,
    [currentStage],
  );

  return (
    <div className="flex min-h-[calc(100dvh-180px)] flex-col pb-1">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="surface-card soft-press flex h-11 w-11 items-center justify-center rounded-2xl"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Fix My WiFi</h1>
          <p className="text-xs font-medium text-muted-foreground">Quick diagnostic test</p>
        </div>
      </div>

      {step === "ready" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center animate-fade-in-up">
          <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-primary/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
            <Wifi className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h2 className="mb-2 text-[30px] font-bold tracking-tight text-foreground">
              Quick Diagnostic
            </h2>
            <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
              WiFi Coach will check your current connection and explain what is wrong, why it is
              happening, and what to do next.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            {TEST_STAGES.map(({ icon: Icon, text }) => (
              <div key={text} className="surface-card flex items-center gap-3 rounded-[24px] px-4 py-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{text}</span>
              </div>
            ))}
          </div>
          {error ? <InlineAlert variant="warning">{error}</InlineAlert> : null}
          <Button
            onClick={() => setStep("testing")}
            className="w-full max-w-sm min-h-[56px] text-base font-semibold"
          >
            Start Test
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      ) : null}

      {step === "testing" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center animate-fade-in">
          <ScanningIllustration className="w-40 h-40" />
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Testing...</h2>
            <p className="text-sm text-muted-foreground">{currentStageText}</p>
          </div>
          <div className="w-full max-w-sm space-y-2.5">
            {TEST_STAGES.map(({ icon: Icon, text }, index) => {
              const isComplete = index < currentStage;
              const isCurrent = index === currentStage;
              return (
                <div
                  key={text}
                  className={cn(
                    "flex items-center gap-3 rounded-[24px] px-4 py-3.5 transition-all",
                    isComplete
                      ? "bg-score-great/10"
                      : isCurrent
                        ? "bg-primary/10"
                        : "bg-card card-shadow",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isComplete ? "bg-score-great/20" : isCurrent ? "bg-primary/20" : "bg-muted",
                    )}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4 text-score-great" />
                    ) : (
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isCurrent ? "text-primary animate-pulse" : "text-muted-foreground",
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      isComplete
                        ? "text-score-great font-medium"
                        : isCurrent
                          ? "text-primary font-medium"
                          : "text-muted-foreground",
                    )}
                  >
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === "results" && result ? (
        <div className="flex flex-1 flex-col gap-5 animate-fade-in-up">
          <div
            className={cn(
              "rounded-2xl p-6 text-center",
              result.status === "Weak Signal"
                ? "bg-score-weak/10 border border-score-weak/20"
                : result.status === "Fair Coverage"
                  ? "bg-score-fair/10 border border-score-fair/20"
                  : "bg-score-great/10 border border-score-great/20",
            )}
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                result.status === "Weak Signal"
                  ? "bg-score-weak/20"
                  : result.status === "Fair Coverage"
                    ? "bg-score-fair/20"
                    : "bg-score-great/20",
              )}
            >
              {result.status === "Great WiFi" ? (
                <SuccessIllustration className="w-12 h-12" />
              ) : (
                <AlertTriangle
                  className={cn(
                    "w-8 h-8",
                    result.status === "Weak Signal" ? "text-score-weak" : "text-score-fair",
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2",
                result.status === "Weak Signal" && "bg-score-weak/20 text-score-weak",
                result.status === "Fair Coverage" && "bg-score-fair/20 text-score-fair",
                result.status === "Great WiFi" && "bg-score-great/20 text-score-great",
              )}
            >
              {result.status}
            </span>
            <h2 className="text-xl font-bold text-foreground">{result.problem}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={Download} label="Download" value={Math.round(result.downloadMbps)} unit="Mbps" />
            <MetricCard icon={Upload} label="Upload" value={Math.round(result.uploadMbps)} unit="Mbps" />
            <MetricCard icon={Clock3} label="Latency" value={Math.round(result.latencyMs)} unit="ms" />
            <MetricCard icon={Activity} label="Packet Loss" value={Number(result.packetLossPct.toFixed(1))} unit="%" />
          </div>

          <SurfaceCard className="space-y-4 p-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Why this is happening
              </p>
              <p className="text-sm font-medium text-foreground">{result.cause}</p>
            </div>
            <div className="h-px bg-border" />
            <div>
              <p className="text-xs text-primary uppercase tracking-wide mb-1">What to do next</p>
              <p className="text-sm font-medium text-foreground">{result.fix}</p>
            </div>
            <div className="h-px bg-border" />
            <div>
              <p className="text-xs text-score-great uppercase tracking-wide mb-1">
                Expected improvement
              </p>
              <p className="text-sm font-medium text-score-great">{result.expectedImprovement}</p>
            </div>
          </SurfaceCard>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setStep("ready");
              }}
              className="min-h-[52px] font-semibold"
            >
              Run Again
            </Button>
            <Button
              onClick={() => router.push(weakRooms > 0 ? "/scan" : "/")}
              className="min-h-[52px] font-semibold"
            >
              {weakRooms > 0 ? "Scan Rooms" : "Back Home"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildDiagnosticResult({
  latencyMs,
  downloadMbps,
  uploadMbps,
  packetLossPct,
  weakRooms,
}: {
  latencyMs: number;
  downloadMbps: number;
  uploadMbps: number;
  packetLossPct: number;
  weakRooms: number;
}): QuickDiagnosticResult {
  let status: QuickDiagnosticResult["status"] = "Great WiFi";
  let problem = "Your WiFi looks healthy";
  let cause = "Current speed and stability look good for everyday use.";
  let fix = "Keep the router where it is and re-run a full scan if a room starts feeling slow.";
  let expectedImprovement = "You should keep strong day-to-day WiFi performance.";

  if (weakRooms > 0 || downloadMbps < 20) {
    status = "Weak Signal";
    problem = "Weak WiFi in distant rooms";
    cause = "Router placement is not central enough to reach every room evenly.";
    fix = "Move the router toward a hallway or central area, or add a mesh node near the weak side of the home.";
    expectedImprovement = "Better coverage and stronger speeds in the weaker rooms.";
  } else if (latencyMs > 60 || packetLossPct > 2) {
    status = "Fair Coverage";
    problem = "Latency is higher than it should be";
    cause = "Wireless quality or congestion is making the connection less responsive.";
    fix = "Retry near the router, reduce heavy downloads during calls, and reboot the router if the issue continues.";
    expectedImprovement = "Smoother browsing, calls, and streaming.";
  } else if (uploadMbps < 8) {
    status = "Fair Coverage";
    problem = "Upload speed is holding the connection back";
    cause = "The signal is good enough for browsing, but weaker for calls and uploads.";
    fix = "Try moving closer to the router for calls or improve coverage in the rooms where you work most.";
    expectedImprovement = "Better video calls and faster uploads.";
  }

  return {
    id: uuid(),
    createdAt: Date.now(),
    latencyMs,
    downloadMbps,
    uploadMbps,
    packetLossPct,
    status,
    problem,
    cause,
    fix,
    expectedImprovement,
  };
}

function MetricCard({
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
    />
  );
}
