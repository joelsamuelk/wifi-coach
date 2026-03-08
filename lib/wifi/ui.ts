import type { WifiConnectionInfo, WifiPlatformSupport } from "./types";

export function getConnectedWifiLabel(
  connection: WifiConnectionInfo | null,
  support: WifiPlatformSupport | null,
) {
  if (connection?.ssid) {
    return connection.ssid;
  }

  if (connection?.connectionType === "cellular") {
    return "You are currently on cellular";
  }

  if (connection?.connectionType === "ethernet") {
    return "Using ethernet";
  }

  if (connection?.connectionType === "wifi") {
    return "Connected to Wi-Fi, but the network name is not available";
  }

  return support?.canReadCurrentNetwork
    ? "Not currently connected to Wi-Fi"
    : "Not available on this device";
}

export function getWifiAccessExplanation(support: WifiPlatformSupport | null) {
  return (
    support?.message ??
    "We can’t read nearby Wi-Fi networks on this device or in this app mode."
  );
}
