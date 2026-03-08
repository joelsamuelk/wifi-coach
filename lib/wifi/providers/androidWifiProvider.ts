import { getWifiAccessPlugin } from "./capacitorBridge";
import type { WifiPermissionResult, WifiProvider, WifiScanResult } from "../types";

const bridgeMissingMessage =
  "Android Wi-Fi access is available only when the Capacitor WifiAccess plugin is installed in the native app shell.";

function getPluginOrThrow() {
  const plugin = getWifiAccessPlugin();
  if (!plugin) {
    throw new Error(bridgeMissingMessage);
  }
  return plugin;
}

export const androidWifiProvider: WifiProvider = {
  async getCurrentWifiConnection() {
    try {
      return await getPluginOrThrow().getCurrentWifiConnection();
    } catch {
      return {
        ssid: null,
        bssid: null,
        connectionType: "unknown",
        isConnectedToWifi: false,
        permissionState: "unavailable",
      };
    }
  },

  async scanAvailableWifiNetworks() {
    const plugin = getPluginOrThrow();
    const result = await plugin.scanAvailableWifiNetworks();
    return Array.isArray(result) ? result : result.availableNetworks;
  },

  async getWifiScanSnapshot(): Promise<WifiScanResult> {
    try {
      return await getPluginOrThrow().getWifiScanSnapshot();
    } catch {
      return {
        current: {
          ssid: null,
          bssid: null,
          connectionType: "unknown",
          isConnectedToWifi: false,
          permissionState: "unavailable",
        },
        availableNetworks: [],
        scannedAt: Date.now(),
        platformSupport: {
          platform: "android",
          canReadCurrentNetwork: false,
          canScanNearbyNetworks: false,
          message: bridgeMissingMessage,
        },
      };
    }
  },

  async requestWifiPermissionsIfNeeded(): Promise<WifiPermissionResult> {
    try {
      return await getPluginOrThrow().requestWifiPermissionsIfNeeded();
    } catch {
      return {
        permissionState: "unavailable",
        granted: false,
        message: bridgeMissingMessage,
      };
    }
  },
};
