"use client";

import { useEffect, useMemo } from "react";
import { useDeviceDiscoveryStore } from "@/lib/devices";
import {
  useDiagnosticsStore,
  useRoomsStore,
  useScanStore,
  useSettingsStore,
} from "@/lib/stores";
import { buildMockAdminDataset } from "./mock-data";
import { buildAdminDataset } from "./selectors";

export function useAdminData() {
  const rooms = useRoomsStore((state) => state.rooms);
  const roomsLoaded = useRoomsStore((state) => state.loaded);
  const scans = useScanStore((state) => state.scans);
  const scansLoaded = useScanStore((state) => state.loaded);
  const diagnostics = useDiagnosticsStore((state) => state.diagnostics);
  const diagnosticsLoaded = useDiagnosticsStore((state) => state.loaded);
  const settings = useSettingsStore();
  const deviceSupport = useDeviceDiscoveryStore((state) => state.support);
  const devices = useDeviceDiscoveryStore((state) => state.devices);
  const lastScannedAt = useDeviceDiscoveryStore((state) => state.lastScannedAt);
  const loadSupport = useDeviceDiscoveryStore((state) => state.loadSupport);
  const refreshDevices = useDeviceDiscoveryStore((state) => state.refreshDevices);

  useEffect(() => {
    if (!deviceSupport) {
      void loadSupport().catch(() => {});
    }
  }, [deviceSupport, loadSupport]);

  useEffect(() => {
    if (
      deviceSupport?.canDiscoverDevices &&
      (!lastScannedAt || Date.now() - lastScannedAt > 60_000)
    ) {
      void refreshDevices().catch(() => {});
    }
  }, [deviceSupport, lastScannedAt, refreshDevices]);

  const dataset = useMemo(
    () => {
      const useMockDataset =
        scans.length === 0 &&
        diagnostics.length === 0 &&
        rooms.length === 0 &&
        process.env.NODE_ENV !== "production";

      if (useMockDataset) {
        return buildMockAdminDataset();
      }

      return buildAdminDataset({
        source: "local",
        scans,
        diagnostics,
        rooms,
        settings,
        devices,
        deviceSupport,
      });
    },
    [deviceSupport, devices, diagnostics, rooms, scans, settings],
  );

  return {
    dataset,
    ready: roomsLoaded && scansLoaded && diagnosticsLoaded && settings.loaded,
  };
}
