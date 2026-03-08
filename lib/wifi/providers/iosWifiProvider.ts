import { getWifiAccessPlugin } from "./capacitorBridge";
import type { WifiPermissionResult, WifiProvider, WifiScanResult } from "../types";

const bridgeMissingMessage =
  "iOS Wi-Fi access is available only when the Capacitor WifiAccess plugin is installed in the native app shell.";

function getPluginOrThrow() {
  const plugin = getWifiAccessPlugin();
  if (!plugin) {
    throw new Error(bridgeMissingMessage);
  }
  return plugin;
}

export const iosWifiProvider: WifiProvider = {
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
    try {
      const result = await getPluginOrThrow().scanAvailableWifiNetworks();
      return Array.isArray(result) ? result : result.availableNetworks;
    } catch {
      return [];
    }
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
          platform: "ios",
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
