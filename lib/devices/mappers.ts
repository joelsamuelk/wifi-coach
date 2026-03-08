import type {
  DeviceDiscoveryMode,
  DeviceDiscoveryResult,
  DeviceDiscoverySummary,
  DeviceDiscoverySupport,
  DiscoveredDevice,
} from "./types";

export function buildDeviceSummary(devices: DiscoveredDevice[]): DeviceDiscoverySummary {
  return {
    totalDevices: devices.length,
    onlineDevices: devices.filter((device) => device.status === "online").length,
    weakDevices: devices.filter((device) => device.signalLabel === "weak").length,
    highLatencyDevices: devices.filter((device) => (device.latencyMs ?? 0) > 80).length,
  };
}

export function createSupport(
  discoveryMode: DeviceDiscoveryMode,
  canDiscoverDevices: boolean,
  reason: string | null,
): DeviceDiscoverySupport {
  return {
    canDiscoverDevices,
    discoveryMode,
    reason,
  };
}

export function createDeviceDiscoveryResult(input: {
  devices: DiscoveredDevice[];
  support: DeviceDiscoverySupport;
  scannedAt?: number;
}): DeviceDiscoveryResult {
  return {
    devices: input.devices,
    scannedAt: input.scannedAt ?? Date.now(),
    support: input.support,
    summary: buildDeviceSummary(input.devices),
  };
}

export function createUnsupportedDiscoveryResult(
  discoveryMode: DeviceDiscoveryMode,
  reason: string,
): DeviceDiscoveryResult {
  return createDeviceDiscoveryResult({
    devices: [],
    support: createSupport(discoveryMode, false, reason),
  });
}
