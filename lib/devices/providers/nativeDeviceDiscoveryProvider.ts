import { createUnsupportedDiscoveryResult, createSupport } from "../mappers";
import type { DeviceDiscoveryProvider } from "../types";

const REASON =
  "This web build does not have native device discovery support. Supported mobile builds can add it later without changing this screen.";

// Placeholder for a future native bridge on supported mobile shells.
export const nativeDeviceDiscoveryProvider: DeviceDiscoveryProvider = {
  async getSupport() {
    return createSupport("native", false, REASON);
  },

  async discoverDevices() {
    return createUnsupportedDiscoveryResult("native", REASON);
  },

  async refreshDevices() {
    return createUnsupportedDiscoveryResult("native", REASON);
  },

  async getDeviceSummary() {
    return {
      totalDevices: 0,
      onlineDevices: 0,
      weakDevices: 0,
      highLatencyDevices: 0,
    };
  },
};
