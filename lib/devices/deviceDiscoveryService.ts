import { localBridgeDeviceDiscoveryProvider } from "./providers/localBridgeDeviceDiscoveryProvider";
import { mockDeviceDiscoveryProvider } from "./providers/mockDeviceDiscoveryProvider";
import { nativeDeviceDiscoveryProvider } from "./providers/nativeDeviceDiscoveryProvider";
import { webDeviceDiscoveryProvider } from "./providers/webDeviceDiscoveryProvider";
import type {
  DeviceDiscoveryProvider,
  DeviceDiscoveryResult,
  DeviceDiscoverySummary,
  DeviceDiscoverySupport,
} from "./types";

function getProvider(): DeviceDiscoveryProvider {
  const configuredProvider = process.env.NEXT_PUBLIC_DEVICE_DISCOVERY_PROVIDER;

  if (configuredProvider === "mock") {
    // Dev-only escape hatch for product development. Production web mode must
    // never silently show fake devices.
    if (process.env.NODE_ENV === "development") {
      return mockDeviceDiscoveryProvider;
    }
    return webDeviceDiscoveryProvider;
  }

  if (configuredProvider === "local-bridge") {
    return localBridgeDeviceDiscoveryProvider;
  }

  if (configuredProvider === "native") {
    return nativeDeviceDiscoveryProvider;
  }

  return webDeviceDiscoveryProvider;
}

export async function getDeviceDiscoverySupport(): Promise<DeviceDiscoverySupport> {
  return getProvider().getSupport();
}

export async function discoverDevices(): Promise<DeviceDiscoveryResult> {
  return getProvider().discoverDevices();
}

export async function refreshDevices(): Promise<DeviceDiscoveryResult> {
  return getProvider().refreshDevices();
}

export async function getDeviceSummary(): Promise<DeviceDiscoverySummary> {
  return getProvider().getDeviceSummary();
}
