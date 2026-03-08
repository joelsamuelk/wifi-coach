import { createUnsupportedDiscoveryResult, createSupport } from "../mappers";
import type { DeviceDiscoveryProvider } from "../types";

const WEB_UNAVAILABLE_REASON =
  "Device discovery is not available in browser mode yet. You can still scan your rooms and improve your home WiFi.";

export const webDeviceDiscoveryProvider: DeviceDiscoveryProvider = {
  async getSupport() {
    return createSupport("web-unavailable", false, WEB_UNAVAILABLE_REASON);
  },

  async discoverDevices() {
    return createUnsupportedDiscoveryResult("web-unavailable", WEB_UNAVAILABLE_REASON);
  },

  async refreshDevices() {
    return createUnsupportedDiscoveryResult("web-unavailable", WEB_UNAVAILABLE_REASON);
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
