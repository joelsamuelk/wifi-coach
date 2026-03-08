import { createUnsupportedDiscoveryResult, createSupport } from "../mappers";
import type { DeviceDiscoveryProvider } from "../types";

const REASON =
  "This build does not include the local network bridge yet. Device discovery will be available once a supported local bridge is installed.";

// Placeholder for a future local companion bridge that could safely provide
// device visibility to the web app without changing the UI contracts.
export const localBridgeDeviceDiscoveryProvider: DeviceDiscoveryProvider = {
  async getSupport() {
    return createSupport("local-bridge", false, REASON);
  },

  async discoverDevices() {
    return createUnsupportedDiscoveryResult("local-bridge", REASON);
  },

  async refreshDevices() {
    return createUnsupportedDiscoveryResult("local-bridge", REASON);
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
