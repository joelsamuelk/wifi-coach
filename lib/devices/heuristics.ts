import type { DeviceSignalLabel, DiscoveredDevice, DiscoveredDeviceType } from "./types";

export function getSignalLabelCopy(signalLabel: DeviceSignalLabel) {
  switch (signalLabel) {
    case "excellent":
      return "Excellent connection";
    case "good":
      return "Good connection";
    case "fair":
      return "Fair connection";
    case "weak":
      return "Weak connection";
    default:
      return "Connection quality unavailable";
  }
}

export function getDeviceTypeCopy(type: DiscoveredDeviceType) {
  switch (type) {
    case "phone":
      return "Phone";
    case "laptop":
      return "Laptop";
    case "tv":
      return "TV";
    case "console":
      return "Game console";
    case "tablet":
      return "Tablet";
    case "smart-home":
      return "Smart home";
    case "router":
      return "Router";
    default:
      return "Device";
  }
}

export function getDeviceHeadline(device: DiscoveredDevice) {
  if (device.status === "offline") {
    return "Currently offline";
  }

  if (device.signalLabel === "weak") {
    return "Weak connection";
  }

  if ((device.latencyMs ?? 0) > 80) {
    return "High latency";
  }

  if (device.signalLabel === "fair") {
    return "Fair connection";
  }

  if (device.signalLabel === "excellent" || device.signalLabel === "good") {
    return getSignalLabelCopy(device.signalLabel);
  }

  return "Connection quality unavailable";
}

export function getDeviceInterpretation(device: DiscoveredDevice) {
  if (device.status === "offline") {
    return "This device is not active right now, so its WiFi quality may change when it reconnects.";
  }

  if (device.signalLabel === "weak") {
    if (device.type === "tv") {
      return "Streaming may buffer or drop quality on this device.";
    }
    if (device.type === "console") {
      return "Gaming and downloads may feel less reliable here.";
    }
    return "This device may struggle in its current spot on your WiFi.";
  }

  if ((device.latencyMs ?? 0) > 80) {
    if (device.type === "console") {
      return "Gaming may feel laggy because response time is high.";
    }
    if (device.type === "phone" || device.type === "tablet" || device.type === "laptop") {
      return "Calls, browsing, or cloud apps may feel slower than usual.";
    }
    return "Response time looks high on this device.";
  }

  if (device.signalLabel === "fair") {
    return "This device should work, but it may not feel as consistent as your strongest rooms.";
  }

  if (device.signalLabel === "excellent" || device.signalLabel === "good") {
    return "This device looks healthy on your current WiFi setup.";
  }

  return "WiFi Coach could not tell how strong this device connection is.";
}

export function getDeviceInsightSummary(devices: DiscoveredDevice[]) {
  const weakDevices = devices.filter((device) => device.signalLabel === "weak");
  const highLatencyDevices = devices.filter((device) => (device.latencyMs ?? 0) > 80);

  if (weakDevices.length > 0) {
    return weakDevices.length === 1
      ? "1 device may be struggling with weak connection."
      : `${weakDevices.length} devices may be struggling with weak connection.`;
  }

  if (highLatencyDevices.length > 0) {
    return highLatencyDevices.length === 1
      ? "1 device is seeing higher latency than expected."
      : `${highLatencyDevices.length} devices are seeing higher latency than expected.`;
  }

  if (devices.length > 0) {
    return "Your detected devices look mostly healthy right now.";
  }

  return "No device insights are available yet.";
}
