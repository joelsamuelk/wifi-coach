export type WifiPermissionState = "granted" | "denied" | "prompt" | "unavailable";
export type WifiConnectionType = "wifi" | "cellular" | "ethernet" | "unknown";
export type WifiRuntimePlatform = "web" | "android" | "ios" | "unknown";

export interface WifiConnectionInfo {
  ssid: string | null;
  bssid?: string | null;
  connectionType: WifiConnectionType;
  isConnectedToWifi: boolean;
  permissionState?: WifiPermissionState;
}

export interface WifiNetwork {
  ssid: string;
  bssid?: string | null;
  signalLevel?: number | null;
  frequency?: number | null;
  security?: string | null;
  isCurrent?: boolean;
}

export interface WifiPlatformSupport {
  platform: WifiRuntimePlatform;
  canReadCurrentNetwork: boolean;
  canScanNearbyNetworks: boolean;
  message: string;
}

export interface WifiScanResult {
  current: WifiConnectionInfo;
  availableNetworks: WifiNetwork[];
  scannedAt: number;
  platformSupport: WifiPlatformSupport;
}

export interface WifiPermissionResult {
  permissionState: WifiPermissionState;
  granted: boolean;
  message: string;
}

export interface WifiProvider {
  getCurrentWifiConnection(): Promise<WifiConnectionInfo>;
  scanAvailableWifiNetworks(): Promise<WifiNetwork[]>;
  getWifiScanSnapshot(): Promise<WifiScanResult>;
  requestWifiPermissionsIfNeeded(): Promise<WifiPermissionResult>;
}
