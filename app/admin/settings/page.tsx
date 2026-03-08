"use client";

import { useMemo, useState } from "react";
import { Cpu, Settings2, ShieldAlert, Wifi, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DetailPanel, KPIStatCard, StatusBadge } from "@/components/admin";
import { ADMIN_FEATURE_FLAGS, ADMIN_SCORING_THRESHOLDS } from "@/lib/admin/config";
import {
  useDiagnosticsStore,
  useScanStore,
  useSettingsStore,
} from "@/lib/stores";
import { useDeviceDiscoveryStore } from "@/lib/devices";
import { useWifiNetworkStore } from "@/lib/wifi";

const RULE_CARDS = [
  {
    id: "router-central",
    title: "Router placement guidance",
    description: "Prioritize central placement and hallway mesh advice for distant weak rooms.",
    priority: "High",
    active: true,
  },
  {
    id: "congestion-latency",
    title: "Latency congestion guidance",
    description: "Recommend rebooting the router or reducing upload congestion when latency spikes.",
    priority: "Medium",
    active: true,
  },
  {
    id: "obstruction-rule",
    title: "Obstruction reduction guidance",
    description: "Suggest reducing obstructions when speeds vary sharply between neighboring rooms.",
    priority: "Medium",
    active: true,
  },
];

export default function AdminSettingsPage() {
  const settings = useSettingsStore();
  const scanStore = useScanStore();
  const diagnosticsStore = useDiagnosticsStore();
  const deviceSupport = useDeviceDiscoveryStore((state) => state.support);
  const wifiSupport = useWifiNetworkStore((state) => state.platformSupport);
  const [previewFlags, setPreviewFlags] = useState<Record<string, boolean>>({
    device_discovery: true,
    mock_device_provider:
      process.env.NEXT_PUBLIC_DEVICE_DISCOVERY_PROVIDER === "mock",
    weak_wifi_simulation: settings.simulateWeak,
    share_score: true,
    live_monitor: false,
    admin_analytics: true,
  });

  const providerModes = useMemo(
    () => ({
      device: process.env.NEXT_PUBLIC_DEVICE_DISCOVERY_PROVIDER ?? "web",
      wifi: process.env.NEXT_PUBLIC_WIFI_PROVIDER ?? "web",
    }),
    [],
  );

  async function resetAllData() {
    if (!window.confirm("Reset all local app data for this admin preview?")) {
      return;
    }

    await settings.reset();
    scanStore.clear();
    diagnosticsStore.clear();
  }

  async function clearDiagnostics() {
    if (!window.confirm("Clear saved diagnostics from the local admin snapshot?")) {
      return;
    }

    diagnosticsStore.clear();
  }

  async function clearScans() {
    if (!window.confirm("Clear saved scan history from the local admin snapshot?")) {
      return;
    }

    scanStore.clear();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIStatCard icon={Settings2} label="Device provider" value={providerModes.device} />
        <KPIStatCard icon={Wifi} label="Wi-Fi provider" value={providerModes.wifi} />
        <KPIStatCard
          icon={Cpu}
          label="Device support"
          value={deviceSupport?.discoveryMode ?? "unknown"}
        />
        <KPIStatCard
          icon={Wrench}
          label="Wi-Fi support"
          value={wifiSupport?.platform ?? "web"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailPanel
          title="Scoring configuration"
          subtitle="Current thresholds mirrored from the scoring engine."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ThresholdRow label="Latency good under" value={`${ADMIN_SCORING_THRESHOLDS.latency.goodUnderMs} ms`} />
            <ThresholdRow label="Latency fair under" value={`${ADMIN_SCORING_THRESHOLDS.latency.fairUnderMs} ms`} />
            <ThresholdRow label="Download good over" value={`${ADMIN_SCORING_THRESHOLDS.download.goodOverMbps} Mbps`} />
            <ThresholdRow label="Download fair over" value={`${ADMIN_SCORING_THRESHOLDS.download.fairOverMbps} Mbps`} />
            <ThresholdRow label="Packet loss weak over" value={`${ADMIN_SCORING_THRESHOLDS.packetLoss.weakOverPct}%`} />
            <ThresholdRow label="Excellent score min" value={`${ADMIN_SCORING_THRESHOLDS.scoreBands.excellentMin}`} />
          </div>
        </DetailPanel>

        <DetailPanel
          title="Recommendation rules"
          subtitle="Preview of the recommendation logic the team can tune later."
        >
          <div className="space-y-3">
            {RULE_CARDS.map((rule) => (
              <div
                key={rule.id}
                className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{rule.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={`${rule.priority} priority`} tone="info" />
                    <Switch checked={rule.active} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DetailPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailPanel
          title="Provider modes"
          subtitle="Environment-driven provider state for Wi-Fi and device discovery."
        >
          <div className="space-y-3">
            <ProviderRow label="Wi-Fi provider mode" value={providerModes.wifi} />
            <ProviderRow label="Device discovery mode" value={providerModes.device} />
            <ProviderRow label="Device support reason" value={deviceSupport?.reason ?? "Not loaded yet"} />
            <ProviderRow label="Wi-Fi support note" value={wifiSupport?.message ?? "Not loaded yet"} />
          </div>
        </DetailPanel>

        <DetailPanel
          title="Test endpoints"
          subtitle="These fields update the same local-first settings store used by the consumer app."
        >
          <div className="space-y-4">
            <Field label="Ping URL" value={settings.pingUrl} onChange={(value) => void settings.setPingUrl(value)} />
            <Field label="Download URL" value={settings.downloadUrl} onChange={(value) => void settings.setDownloadUrl(value)} />
            <Field label="Upload URL" value={settings.uploadUrl} onChange={(value) => void settings.setUploadUrl(value)} />
            <div className="flex items-center justify-between rounded-[24px] border border-slate-200/70 bg-slate-50/70 px-4 py-4">
              <div>
                <p className="font-medium text-slate-950">Weak Wi-Fi simulation</p>
                <p className="text-sm leading-6 text-slate-500">
                  Affects the consumer test engine immediately.
                </p>
              </div>
              <Switch
                checked={settings.simulateWeak}
                onCheckedChange={(checked) => void settings.setSimulateWeak(checked)}
              />
            </div>
          </div>
        </DetailPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailPanel
          title="Feature flags"
          subtitle="Internal preview toggles for future server-managed config."
        >
          <div className="space-y-3">
            {[...ADMIN_FEATURE_FLAGS, {
              id: "share_score",
              label: "Share score",
              description: "Expose share score actions in results and history.",
            }, {
              id: "live_monitor",
              label: "Live monitor",
              description: "Future live network monitoring surface.",
            }, {
              id: "admin_analytics",
              label: "Admin analytics",
              description: "Control analytics views in the admin dashboard.",
            }].map((flag) => (
              <div
                key={flag.id}
                className="flex items-center justify-between rounded-[24px] border border-slate-200/70 bg-slate-50/70 px-4 py-4"
              >
                <div>
                  <p className="font-medium text-slate-950">{flag.label}</p>
                  <p className="text-sm leading-6 text-slate-500">{flag.description}</p>
                </div>
                <Switch
                  checked={previewFlags[flag.id] ?? false}
                  onCheckedChange={(checked) =>
                    setPreviewFlags((current) => ({ ...current, [flag.id]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Danger zone"
          subtitle="Destructive local actions for internal testing and support workflows."
        >
          <div className="space-y-3">
            <DangerButton
              title="Reset app data"
              description="Reset local settings and clear in-memory scan and diagnostic state."
              onClick={() => void resetAllData()}
            />
            <DangerButton
              title="Clear diagnostics"
              description="Remove saved quick diagnostic records from the current snapshot."
              onClick={() => void clearDiagnostics()}
            />
            <DangerButton
              title="Clear scan history"
              description="Remove saved room-by-room scans from the current snapshot."
              onClick={() => void clearScans()}
            />
          </div>
        </DetailPanel>
      </div>
    </div>
  );
}

function ThresholdRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ProviderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-slate-950">{label}</label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-slate-200 bg-slate-50"
      />
    </div>
  );
}

function DangerButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[24px] border border-rose-200/70 bg-rose-50/70 px-4 py-4">
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-600" />
          <p className="font-medium text-rose-900">{title}</p>
        </div>
        <p className="mt-1 text-sm leading-6 text-rose-900/80">{description}</p>
      </div>
      <Button variant="destructive" onClick={onClick}>
        Run
      </Button>
    </div>
  );
}
