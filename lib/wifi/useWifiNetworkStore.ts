"use client";

import { create } from "zustand";
import {
  getCurrentWifiConnection,
  getWifiScanSnapshot,
  requestWifiPermissionsIfNeeded,
  scanAvailableWifiNetworks,
} from "./wifiService";
import type {
  WifiConnectionInfo,
  WifiPermissionState,
  WifiPlatformSupport,
  WifiScanResult,
} from "./types";

interface WifiNetworkStore {
  currentConnection: WifiConnectionInfo | null;
  availableNetworks: WifiScanResult["availableNetworks"];
  lastScannedAt: number | null;
  permissionState: WifiPermissionState | null;
  isLoading: boolean;
  error: string | null;
  platformSupport: WifiPlatformSupport | null;
  refreshCurrentConnection: () => Promise<WifiConnectionInfo>;
  scanNetworks: () => Promise<WifiScanResult["availableNetworks"]>;
  refreshWifiSnapshot: () => Promise<WifiScanResult>;
  requestPermissions: () => Promise<void>;
  clearError: () => void;
}

export const useWifiNetworkStore = create<WifiNetworkStore>((set, get) => ({
  currentConnection: null,
  availableNetworks: [],
  lastScannedAt: null,
  permissionState: null,
  isLoading: false,
  error: null,
  platformSupport: null,

  async refreshCurrentConnection() {
    set({ isLoading: true, error: null });
    try {
      const snapshot =
        get().platformSupport === null ? await getWifiScanSnapshot() : null;
      const currentConnection = snapshot
        ? snapshot.current
        : await getCurrentWifiConnection();

      set({
        currentConnection,
        permissionState: currentConnection.permissionState ?? get().permissionState,
        lastScannedAt: snapshot?.scannedAt ?? get().lastScannedAt,
        platformSupport: snapshot?.platformSupport ?? get().platformSupport,
        availableNetworks: snapshot?.availableNetworks ?? get().availableNetworks,
        isLoading: false,
      });
      return currentConnection;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not read Wi-Fi information.";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  async scanNetworks() {
    set({ isLoading: true, error: null });
    try {
      const snapshot =
        get().platformSupport === null ? await getWifiScanSnapshot() : null;
      const availableNetworks = snapshot
        ? snapshot.availableNetworks
        : await scanAvailableWifiNetworks();

      set({
        availableNetworks,
        lastScannedAt: snapshot?.scannedAt ?? Date.now(),
        platformSupport: snapshot?.platformSupport ?? get().platformSupport,
        currentConnection: snapshot?.current ?? get().currentConnection,
        permissionState:
          snapshot?.current.permissionState ?? get().permissionState,
        isLoading: false,
      });
      return availableNetworks;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not scan nearby Wi-Fi networks.";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  async refreshWifiSnapshot() {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await getWifiScanSnapshot();
      set({
        currentConnection: snapshot.current,
        availableNetworks: snapshot.availableNetworks,
        lastScannedAt: snapshot.scannedAt,
        permissionState: snapshot.current.permissionState ?? null,
        platformSupport: snapshot.platformSupport,
        isLoading: false,
      });
      return snapshot;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not refresh Wi-Fi information.";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  async requestPermissions() {
    set({ isLoading: true, error: null });
    try {
      const result = await requestWifiPermissionsIfNeeded();
      set({
        permissionState: result.permissionState,
        error: result.permissionState === "denied" ? result.message : null,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not request Wi-Fi permissions.";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError() {
    set({ error: null });
  },
}));
