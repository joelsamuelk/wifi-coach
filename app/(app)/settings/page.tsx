"use client";

import { useEffect, useState } from "react";
import { RefreshCw, RotateCcw, Shield, Trash2, User, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { SectionHeader, SurfaceCard } from "@/components/wifi/app-primitives";
import { InlineAlert } from "@/components/wifi/inline-alert";
import { storage } from "@/lib/db";
import {
  useDiagnosticsStore,
  useOnboardingStore,
  useRoomsStore,
  useScanStore,
  useSettingsStore,
} from "@/lib/stores";
import { useWifiNetworkStore } from "@/lib/wifi";
import { getConnectedWifiLabel, getWifiAccessExplanation } from "@/lib/wifi/ui";

const SCAN_DRAFT_KEY = "wc_scan_draft";
const DEMO_MODE_KEY = "wificoach_demo_mode";

export default function SettingsPage() {
  const router = useRouter();
  const settings = useSettingsStore();
  const roomsStore = useRoomsStore();
  const scanStore = useScanStore();
  const diagnosticsStore = useDiagnosticsStore();
  const onboardingStore = useOnboardingStore();
  const currentConnection = useWifiNetworkStore((state) => state.currentConnection);
  const platformSupport = useWifiNetworkStore((state) => state.platformSupport);
  const permissionState = useWifiNetworkStore((state) => state.permissionState);
  const lastScannedAt = useWifiNetworkStore((state) => state.lastScannedAt);
  const availableNetworks = useWifiNetworkStore((state) => state.availableNetworks);
  const isWifiLoading = useWifiNetworkStore((state) => state.isLoading);
  const wifiError = useWifiNetworkStore((state) => state.error);
  const refreshWifiSnapshot = useWifiNetworkStore((state) => state.refreshWifiSnapshot);
  const requestPermissions = useWifiNetworkStore((state) => state.requestPermissions);

  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!lastScannedAt || Date.now() - lastScannedAt > 30_000) {
      void refreshWifiSnapshot();
    }
  }, [lastScannedAt, refreshWifiSnapshot]);

  async function handleResetAllData() {
    await storage.clearAll();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SCAN_DRAFT_KEY);
      window.localStorage.removeItem(DEMO_MODE_KEY);
    }
    await settings.reset();
    await roomsStore.hydrate();
    await scanStore.hydrate();
    await diagnosticsStore.hydrate();
    onboardingStore.complete();
    router.replace("/");
  }

  async function handleClearLocalSession() {
    await settings.setProfileName("Home WiFi");
    await settings.setLastNetworkName("My Wi-Fi");
  }

  return (
    <div className="flex flex-col gap-6 pb-1">
      <h1 className="text-[30px] font-bold tracking-tight text-foreground">Settings</h1>

      <SurfaceCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">Local profile</p>
            <p className="text-sm text-muted-foreground truncate">
              Stored only on this device for MVP
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">Profile name</Label>
            <Input
              id="profile-name"
              value={settings.profileName}
              onChange={(event) => void settings.setProfileName(event.target.value)}
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="last-network">Default network name</Label>
            <Input
              id="last-network"
              value={settings.lastNetworkName}
              onChange={(event) => void settings.setLastNetworkName(event.target.value)}
              className="h-11"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => void handleClearLocalSession()}
            className="w-full min-h-[44px] font-semibold"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear Local Session
          </Button>
        </div>
      </SurfaceCard>

      <div>
        <SectionHeader
          title="Test Endpoints"
          subtitle="These local test routes drive the speed and latency simulation."
          className="mb-3"
        />
        <SurfaceCard className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ping-url">Ping URL</Label>
            <Input
              id="ping-url"
              value={settings.pingUrl}
              onChange={(event) => void settings.setPingUrl(event.target.value)}
              className="h-11 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="download-url">Download URL</Label>
            <Input
              id="download-url"
              value={settings.downloadUrl}
              onChange={(event) => void settings.setDownloadUrl(event.target.value)}
              className="h-11 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="upload-url">Upload URL</Label>
            <Input
              id="upload-url"
              value={settings.uploadUrl}
              onChange={(event) => void settings.setUploadUrl(event.target.value)}
              className="h-11 text-base"
            />
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="flex items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-primary" />
            <p className="font-semibold text-foreground">Simulate weak Wi-Fi</p>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Makes the tests slower and less stable so you can verify weak-signal states.
          </p>
        </div>
        <Switch
          checked={settings.simulateWeak}
          onCheckedChange={(checked) => void settings.setSimulateWeak(checked)}
        />
      </SurfaceCard>

      <div>
        <SectionHeader
          title="Wi-Fi Access"
          subtitle="Understand what this device and browser can show to WiFi Coach."
          className="mb-3"
        />
        <SurfaceCard className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <WifiFact label="Platform" value={platformSupport?.platform ?? "web"} />
            <WifiFact label="Permission" value={permissionState ?? "unavailable"} />
            <WifiFact
              label="Read current Wi-Fi"
              value={platformSupport?.canReadCurrentNetwork ? "Supported" : "Not supported"}
            />
            <WifiFact
              label="Scan nearby Wi-Fi"
              value={platformSupport?.canScanNearbyNetworks ? "Supported" : "Not supported"}
            />
          </div>
          <div className="surface-subtle hairline rounded-[24px] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Current status
            </p>
            <p className="mt-1.5 text-sm font-medium text-foreground">
              {getConnectedWifiLabel(currentConnection, platformSupport)}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {platformSupport?.canScanNearbyNetworks
                ? `${availableNetworks.length} nearby network${availableNetworks.length === 1 ? "" : "s"} available.`
                : getWifiAccessExplanation(platformSupport)}
            </p>
            {wifiError ? (
              <p className="text-xs text-score-weak mt-2">{wifiError}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => void refreshWifiSnapshot()}
              disabled={isWifiLoading}
              className="min-h-[44px] font-semibold"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Wi-Fi
            </Button>
            <Button
              variant="outline"
              onClick={() => void requestPermissions()}
              disabled={isWifiLoading}
              className="min-h-[44px] font-semibold"
            >
              Request Permissions
            </Button>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="font-semibold text-foreground">Reset all app data</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Deletes all rooms, diagnostics, scans, history, and saved local settings.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setConfirmReset(true)}
          className="min-h-[44px] border-destructive/30 font-semibold text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Reset
        </Button>
      </SurfaceCard>

      <InlineAlert variant="info">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          <span>WiFi Coach stores MVP data locally on this device by default.</span>
        </div>
      </InlineAlert>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all app data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently clears rooms, scans, diagnostics, and settings from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleResetAllData()}>
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function WifiFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
