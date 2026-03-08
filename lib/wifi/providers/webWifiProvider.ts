import type {
  WifiConnectionInfo,
  WifiConnectionType,
  WifiPermissionResult,
  WifiProvider,
  WifiScanResult,
} from "../types";

type NavigatorConnection = {
  type?: string;
  effectiveType?: string;
};

function getBrowserConnection(): NavigatorConnection | undefined {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return (navigator as Navigator & {
    connection?: NavigatorConnection;
    mozConnection?: NavigatorConnection;
    webkitConnection?: NavigatorConnection;
  }).connection;
}

function mapConnectionType(): WifiConnectionType {
  const connection = getBrowserConnection();
  const type = connection?.type ?? connection?.effectiveType ?? "";

  if (type === "wifi") {
    return "wifi";
  }
  if (type === "cellular" || type === "4g" || type === "3g" || type === "2g" || type === "5g") {
    return "cellular";
  }
  if (type === "ethernet") {
    return "ethernet";
  }
  return "unknown";
}

function getCurrentConnection(): WifiConnectionInfo {
  const connectionType = mapConnectionType();
  return {
    ssid: null,
    bssid: null,
    connectionType,
    isConnectedToWifi: connectionType === "wifi",
    permissionState: "unavailable",
  };
}

const unsupportedMessage =
  "This browser or app mode does not allow Wi-Fi network names or nearby Wi-Fi scanning.";

export const webWifiProvider: WifiProvider = {
  async getCurrentWifiConnection() {
    return getCurrentConnection();
  },

  async scanAvailableWifiNetworks() {
    return [];
  },

  async getWifiScanSnapshot(): Promise<WifiScanResult> {
    return {
      current: getCurrentConnection(),
      availableNetworks: [],
      scannedAt: Date.now(),
      platformSupport: {
        platform: "web",
        canReadCurrentNetwork: false,
        canScanNearbyNetworks: false,
        message: unsupportedMessage,
      },
    };
  },

  async requestWifiPermissionsIfNeeded(): Promise<WifiPermissionResult> {
    return {
      permissionState: "unavailable",
      granted: false,
      message: unsupportedMessage,
    };
  },
};
