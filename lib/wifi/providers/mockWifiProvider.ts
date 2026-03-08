import type { WifiPermissionResult, WifiProvider, WifiScanResult } from "../types";

const current = {
  ssid: "Home-WiFi-5G",
  bssid: "00:11:22:33:44:55",
  connectionType: "wifi" as const,
  isConnectedToWifi: true,
  permissionState: "granted" as const,
};

const availableNetworks = [
  {
    ssid: "Home-WiFi-5G",
    bssid: "00:11:22:33:44:55",
    signalLevel: 4,
    frequency: 5200,
    security: "WPA2",
    isCurrent: true,
  },
  {
    ssid: "Home-WiFi-2.4G",
    bssid: "00:11:22:33:44:56",
    signalLevel: 3,
    frequency: 2412,
    security: "WPA2",
    isCurrent: false,
  },
  {
    ssid: "Neighbor-WiFi",
    bssid: "00:11:22:AA:BB:CC",
    signalLevel: 2,
    frequency: 2417,
    security: "WPA2",
    isCurrent: false,
  },
];

export const mockWifiProvider: WifiProvider = {
  async getCurrentWifiConnection() {
    return current;
  },

  async scanAvailableWifiNetworks() {
    return availableNetworks;
  },

  async getWifiScanSnapshot(): Promise<WifiScanResult> {
    return {
      current,
      availableNetworks,
      scannedAt: Date.now(),
      platformSupport: {
        platform: "web",
        canReadCurrentNetwork: true,
        canScanNearbyNetworks: true,
        message: "Using the development-only mock Wi-Fi provider.",
      },
    };
  },

  async requestWifiPermissionsIfNeeded(): Promise<WifiPermissionResult> {
    return {
      permissionState: "granted",
      granted: true,
      message: "Using the development-only mock Wi-Fi provider.",
    };
  },
};
