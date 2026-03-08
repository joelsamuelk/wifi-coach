"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Plus, RefreshCw, Scan, Search, Wifi, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardSkeleton, EmptyState, SectionHeader, SurfaceCard } from "@/components/wifi/app-primitives";
import { InlineAlert } from "@/components/wifi/inline-alert";
import { RoomModal } from "@/components/wifi/room-modal";
import { useRoomsStore, useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { useWifiNetworkStore } from "@/lib/wifi";
import { getConnectedWifiLabel, getWifiAccessExplanation } from "@/lib/wifi/ui";

export default function ScanSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-5">
          <CardSkeleton className="h-24" />
          <CardSkeleton className="h-48" />
          <div className="grid grid-cols-2 gap-4">
            <CardSkeleton className="h-28" />
            <CardSkeleton className="h-28" />
          </div>
          <CardSkeleton className="h-64" />
        </div>
      }
    >
      <ScanSetupContent />
    </Suspense>
  );
}

function ScanSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const singleRoomId = searchParams.get("roomId");

  const rooms = useRoomsStore((state) => state.rooms);
  const addRoom = useRoomsStore((state) => state.addRoom);
  const selectedRoomIds = useScanStore((state) => state.selectedRoomIds);
  const networkName = useScanStore((state) => state.networkName);
  const mode = useScanStore((state) => state.mode);
  const setNetworkName = useScanStore((state) => state.setNetworkName);
  const setMode = useScanStore((state) => state.setMode);
  const setSelectedRoomIds = useScanStore((state) => state.setSelectedRoomIds);
  const toggleSelectedRoom = useScanStore((state) => state.toggleSelectedRoom);
  const startScan = useScanStore((state) => state.startScan);
  const currentConnection = useWifiNetworkStore((state) => state.currentConnection);
  const availableNetworks = useWifiNetworkStore((state) => state.availableNetworks);
  const platformSupport = useWifiNetworkStore((state) => state.platformSupport);
  const lastScannedAt = useWifiNetworkStore((state) => state.lastScannedAt);
  const isWifiLoading = useWifiNetworkStore((state) => state.isLoading);
  const wifiError = useWifiNetworkStore((state) => state.error);
  const refreshWifiSnapshot = useWifiNetworkStore((state) => state.refreshWifiSnapshot);

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [manualNetworkName, setManualNetworkName] = useState(false);

  const sortedRooms = useMemo(
    () => [...rooms].sort((left, right) => left.createdAt - right.createdAt),
    [rooms],
  );

  useEffect(() => {
    if (singleRoomId) {
      setSelectedRoomIds([singleRoomId]);
      return;
    }

    if (sortedRooms.length > 0 && selectedRoomIds.length === 0) {
      setSelectedRoomIds(sortedRooms.map((room) => room.id));
    }
  }, [selectedRoomIds.length, setSelectedRoomIds, singleRoomId, sortedRooms]);

  useEffect(() => {
    if (!lastScannedAt || Date.now() - lastScannedAt > 30_000) {
      void refreshWifiSnapshot();
    }
  }, [lastScannedAt, refreshWifiSnapshot]);

  useEffect(() => {
    if (!manualNetworkName && currentConnection?.ssid) {
      setNetworkName(currentConnection.ssid);
    }
  }, [currentConnection?.ssid, manualNetworkName, setNetworkName]);

  const selectedSet = new Set(selectedRoomIds);

  function handleStart() {
    const roomIds = sortedRooms
      .map((room) => room.id)
      .filter((roomId) => selectedSet.has(roomId));

    if (roomIds.length === 0) {
      return;
    }

    startScan(roomIds, mode, networkName);
    router.push("/scan/run");
  }

  async function handleRefreshWifi() {
    const snapshot = await refreshWifiSnapshot();
    if (snapshot.current.ssid) {
      setManualNetworkName(false);
      setNetworkName(snapshot.current.ssid);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-1">
      <div className="pt-1 text-center">
        <h1 className="text-[30px] font-bold tracking-tight text-foreground">
          {singleRoomId ? "Re-scan Room" : "Start a Scan"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {singleRoomId
            ? "Run a fresh room check with your saved scan settings."
            : "Choose your network, scan mode, and rooms to test."}
        </p>
      </div>

      <SurfaceCard className="p-5">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="network-name"
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
          >
            Network name
          </Label>
          <Input
            id="network-name"
            value={networkName}
            onChange={(event) => {
              setManualNetworkName(true);
              setNetworkName(event.target.value);
            }}
            placeholder="My Wi-Fi"
            className="h-12 text-base"
          />
          <div className="surface-subtle hairline mt-3 rounded-[24px] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Connected Wi-Fi
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  {getConnectedWifiLabel(currentConnection, platformSupport)}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {platformSupport?.canReadCurrentNetwork
                    ? "Tap refresh if you switch networks."
                    : "This device or browser does not let WiFi Coach read the network name automatically."}
                </p>
                {wifiError ? (
                  <p className="text-xs text-score-weak mt-2">{wifiError}</p>
                ) : null}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleRefreshWifi()}
                disabled={isWifiLoading}
                className="min-h-[40px]"
              >
                {isWifiLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
          {platformSupport?.canScanNearbyNetworks ? (
            <div className="surface-subtle hairline mt-3 rounded-[24px] px-4 py-4">
              <div className="mb-3 flex items-center gap-2">
                <Wifi className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Available Wi-Fi</p>
              </div>
              {availableNetworks.length > 0 ? (
                <div className="space-y-2">
                  {availableNetworks.map((network) => (
                    <button
                      key={`${network.ssid}-${network.bssid ?? "network"}`}
                      onClick={() => {
                        setManualNetworkName(false);
                        setNetworkName(network.ssid);
                      }}
                      className={cn(
                        "soft-press flex w-full items-center justify-between rounded-2xl border border-transparent px-3 py-3 text-left transition-colors",
                        network.isCurrent
                          ? "border-primary/10 bg-primary/10"
                          : "bg-white/70 hover:bg-white",
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{network.ssid}</p>
                        <p className="text-xs text-muted-foreground">
                          {network.isCurrent ? "Currently connected" : network.security ?? "Nearby network"}
                        </p>
                      </div>
                      {network.isCurrent ? (
                        <span className="text-xs font-semibold text-primary">Current</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No nearby Wi-Fi networks were returned yet.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {getWifiAccessExplanation(platformSupport)}
            </p>
          )}
        </div>
      </SurfaceCard>

      <div>
        <SectionHeader
          title="Scan Mode"
          subtitle="Choose between a quick check or a deeper room-by-room reading."
          className="mb-3"
        />
        <div className="flex gap-3">
          <ModeCard
            active={mode === "Quick"}
            title="Quick"
            subtitle="1 sample per room"
            icon={Zap}
            onClick={() => setMode("Quick")}
          />
          <ModeCard
            active={mode === "Deep"}
            title="Deep"
            subtitle="3 samples per room"
            icon={Search}
            onClick={() => setMode("Deep")}
          />
        </div>
      </div>

      <div>
        <SectionHeader
          title={`Selected Rooms (${selectedRoomIds.length})`}
          subtitle="Choose where you want WiFi Coach to guide you."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddRoom(true)}
              className="min-h-[40px] text-primary"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Room
            </Button>
          }
          className="mb-3"
        />

        <SurfaceCard className="overflow-hidden p-0">
          {sortedRooms.map((room) => (
            <div
              key={room.id}
              role="button"
              tabIndex={0}
              onClick={() => toggleSelectedRoom(room.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleSelectedRoom(room.id);
                }
              }}
              className="flex w-full min-h-[62px] cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 first:rounded-t-[28px] last:rounded-b-[28px]"
            >
              <div
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <Checkbox
                  checked={selectedSet.has(room.id)}
                  onCheckedChange={() => toggleSelectedRoom(room.id)}
                  className="h-5 w-5 rounded-md"
                />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{room.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {room.floor} · {room.type}
                </p>
              </div>
            </div>
          ))}
          {sortedRooms.length === 0 ? (
            <div className="p-3">
              <EmptyState
                icon={MapPin}
                title="No rooms added yet"
                description="Add your rooms first so the guided scan knows where to send you."
                action={<LinkButton href="/rooms" label="Manage Rooms" />}
                className="border-none bg-transparent p-5 shadow-none"
              />
            </div>
          ) : null}
        </SurfaceCard>
      </div>

      {selectedRoomIds.length === 0 ? (
        <InlineAlert variant="warning">
          Select at least one room before starting the scan.
        </InlineAlert>
      ) : null}

      <div className="sticky bottom-24 z-10 -mx-1 mt-1">
        <div className="rounded-[28px] border border-white/60 bg-background/80 p-2 backdrop-blur-xl">
          <Button
            onClick={handleStart}
            disabled={selectedRoomIds.length === 0}
            className="w-full min-h-[56px] text-base font-semibold"
          >
            <Scan className="mr-2 h-5 w-5" />
            Start {mode} Scan
          </Button>
        </div>
      </div>

      <RoomModal
        open={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        onSave={async (room) => {
          const created = await addRoom(room);
          setSelectedRoomIds([...selectedRoomIds, created.id]);
        }}
      />
    </div>
  );
}

function ModeCard({
  active,
  title,
  subtitle,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  icon: typeof Zap;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "surface-card soft-press flex flex-1 min-h-[104px] flex-col items-center justify-center gap-2 p-4 text-center transition-all",
        active
          ? "border-primary/12 bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_18px_30px_rgba(37,99,235,0.22)]"
          : "text-foreground hover:bg-white",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          active ? "bg-white/20" : "bg-primary/10",
        )}
      >
        <Icon className={cn("h-5 w-5", active ? "text-white" : "text-primary")} />
      </div>
      <span className="text-sm font-semibold">{title}</span>
      <span className={cn("text-[11px] leading-5", active ? "text-white/78" : "text-muted-foreground")}>
        {subtitle}
      </span>
    </button>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] items-center rounded-2xl border border-border/80 bg-white/70 px-4 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75)] transition-colors hover:bg-white"
    >
      {label}
    </Link>
  );
}
