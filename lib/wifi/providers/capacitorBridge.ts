import type {
  WifiConnectionInfo,
  WifiNetwork,
  WifiPermissionResult,
  WifiScanResult,
} from "../types";

interface WifiAccessPluginBridge {
  getCurrentWifiConnection(): Promise<WifiConnectionInfo>;
  scanAvailableWifiNetworks(): Promise<{ availableNetworks: WifiNetwork[] } | WifiNetwork[]>;
  getWifiScanSnapshot(): Promise<WifiScanResult>;
  requestWifiPermissionsIfNeeded(): Promise<WifiPermissionResult>;
  openAppSettings?(): Promise<void>;
}

interface CapacitorBridge {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: {
    WifiAccess?: WifiAccessPluginBridge;
  };
}

function getCapacitor() {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as Window & { Capacitor?: CapacitorBridge }).Capacitor ?? null;
}

export function isCapacitorNativePlatform() {
  return getCapacitor()?.isNativePlatform?.() ?? false;
}

export function getCapacitorPlatform() {
  return getCapacitor()?.getPlatform?.() ?? "web";
}

export function getWifiAccessPlugin() {
  return getCapacitor()?.Plugins?.WifiAccess ?? null;
}
