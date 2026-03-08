export type DeviceDiscoveryMode =
  | "web-unavailable"
  | "mock"
  | "local-bridge"
  | "native"
  | "unknown";

export type DiscoveredDeviceType =
  | "phone"
  | "laptop"
  | "tv"
  | "console"
  | "tablet"
  | "smart-home"
  | "router"
  | "unknown";

export type DeviceSignalLabel = "excellent" | "good" | "fair" | "weak" | "unknown";
export type DeviceStatus = "online" | "offline" | "unknown";
export type DeviceConfidence = "high" | "medium" | "low";

export interface DeviceDiscoverySupport {
  canDiscoverDevices: boolean;
  discoveryMode: DeviceDiscoveryMode;
  reason: string | null;
}

export interface DiscoveredDevice {
  id: string;
  name: string;
  type: DiscoveredDeviceType;
  ipAddress: string | null;
  macAddress: string | null;
  vendor: string | null;
  signalLabel: DeviceSignalLabel;
  latencyMs: number | null;
  downloadMbps: number | null;
  uploadMbps: number | null;
  status: DeviceStatus;
  isCurrentDevice: boolean;
  confidence: DeviceConfidence;
  notes: string | null;
  discoveredAt: number;
}

export interface DeviceDiscoverySummary {
  totalDevices: number;
  onlineDevices: number;
  weakDevices: number;
  highLatencyDevices: number;
}

export interface DeviceDiscoveryResult {
  devices: DiscoveredDevice[];
  scannedAt: number;
  support: DeviceDiscoverySupport;
  summary: DeviceDiscoverySummary;
}

export interface DeviceDiscoveryProvider {
  getSupport(): Promise<DeviceDiscoverySupport>;
  discoverDevices(): Promise<DeviceDiscoveryResult>;
  refreshDevices(): Promise<DeviceDiscoveryResult>;
  getDeviceSummary(): Promise<DeviceDiscoverySummary>;
}
