import { createDeviceDiscoveryResult, createSupport } from "../mappers";
import type { DeviceDiscoveryProvider, DiscoveredDevice } from "../types";

function createMockDevices(scannedAt: number): DiscoveredDevice[] {
  return [
    {
      id: "device-router",
      name: "Living Room Router",
      type: "router",
      ipAddress: "192.168.1.1",
      macAddress: null,
      vendor: "Netgear",
      signalLabel: "excellent",
      latencyMs: 9,
      downloadMbps: 182,
      uploadMbps: 48,
      status: "online",
      isCurrentDevice: false,
      confidence: "high",
      notes: "Main router is performing strongly.",
      discoveredAt: scannedAt,
    },
    {
      id: "device-macbook",
      name: "MacBook Pro",
      type: "laptop",
      ipAddress: "192.168.1.12",
      macAddress: null,
      vendor: "Apple",
      signalLabel: "good",
      latencyMs: 18,
      downloadMbps: 128,
      uploadMbps: 36,
      status: "online",
      isCurrentDevice: true,
      confidence: "high",
      notes: "This looks like the device you are using now.",
      discoveredAt: scannedAt,
    },
    {
      id: "device-iphone",
      name: "iPhone",
      type: "phone",
      ipAddress: "192.168.1.22",
      macAddress: null,
      vendor: "Apple",
      signalLabel: "fair",
      latencyMs: 42,
      downloadMbps: 38,
      uploadMbps: 12,
      status: "online",
      isCurrentDevice: false,
      confidence: "medium",
      notes: "Connection is usable, but not as strong as the best devices.",
      discoveredAt: scannedAt,
    },
    {
      id: "device-tv",
      name: "Samsung TV",
      type: "tv",
      ipAddress: "192.168.1.31",
      macAddress: null,
      vendor: "Samsung",
      signalLabel: "weak",
      latencyMs: 67,
      downloadMbps: 14,
      uploadMbps: 5,
      status: "online",
      isCurrentDevice: false,
      confidence: "medium",
      notes: "TV appears to be in a weaker WiFi area.",
      discoveredAt: scannedAt,
    },
    {
      id: "device-playstation",
      name: "PlayStation",
      type: "console",
      ipAddress: "192.168.1.41",
      macAddress: null,
      vendor: "Sony",
      signalLabel: "good",
      latencyMs: 95,
      downloadMbps: 52,
      uploadMbps: 9,
      status: "online",
      isCurrentDevice: false,
      confidence: "medium",
      notes: "Latency looks high for gaming.",
      discoveredAt: scannedAt,
    },
    {
      id: "device-speaker",
      name: "Smart Speaker",
      type: "smart-home",
      ipAddress: "192.168.1.55",
      macAddress: null,
      vendor: "Google",
      signalLabel: "excellent",
      latencyMs: 21,
      downloadMbps: 24,
      uploadMbps: 8,
      status: "online",
      isCurrentDevice: false,
      confidence: "low",
      notes: "Smart-home device looks stable.",
      discoveredAt: scannedAt,
    },
  ];
}

export const mockDeviceDiscoveryProvider: DeviceDiscoveryProvider = {
  async getSupport() {
    return createSupport("mock", true, "Using mock device discovery for development.");
  },

  async discoverDevices() {
    const scannedAt = Date.now();
    return createDeviceDiscoveryResult({
      devices: createMockDevices(scannedAt),
      support: await this.getSupport(),
      scannedAt,
    });
  },

  async refreshDevices() {
    return this.discoverDevices();
  },

  async getDeviceSummary() {
    const result = await this.discoverDevices();
    return result.summary;
  },
};
