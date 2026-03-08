import { androidWifiProvider } from "./providers/androidWifiProvider";
import { iosWifiProvider } from "./providers/iosWifiProvider";
import { mockWifiProvider } from "./providers/mockWifiProvider";
import {
  getCapacitorPlatform,
  isCapacitorNativePlatform,
} from "./providers/capacitorBridge";
import { webWifiProvider } from "./providers/webWifiProvider";
import type {
  WifiConnectionInfo,
  WifiPermissionResult,
  WifiProvider,
  WifiRuntimePlatform,
  WifiScanResult,
} from "./types";

function getRuntimePlatform(): WifiRuntimePlatform {
  if (!isCapacitorNativePlatform()) {
    return "web";
  }

  const platform = getCapacitorPlatform();
  if (platform === "android" || platform === "ios") {
    return platform;
  }
  return "unknown";
}

function getProvider(): WifiProvider {
  const useMockProvider =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_WIFI_PROVIDER === "mock";

  if (useMockProvider) {
    return mockWifiProvider;
  }

  const platform = getRuntimePlatform();
  if (platform === "android") {
    return androidWifiProvider;
  }
  if (platform === "ios") {
    return iosWifiProvider;
  }

  return webWifiProvider;
}

export async function getCurrentWifiConnection(): Promise<WifiConnectionInfo> {
  return getProvider().getCurrentWifiConnection();
}

export async function scanAvailableWifiNetworks() {
  return getProvider().scanAvailableWifiNetworks();
}

export async function getWifiScanSnapshot(): Promise<WifiScanResult> {
  return getProvider().getWifiScanSnapshot();
}

export async function requestWifiPermissionsIfNeeded(): Promise<WifiPermissionResult> {
  return getProvider().requestWifiPermissionsIfNeeded();
}

export function getWifiRuntimePlatform() {
  return getRuntimePlatform();
}
