import Capacitor
import Foundation
import NetworkExtension

@objc(WifiAccessPlugin)
public class WifiAccessPlugin: CAPPlugin, CAPBridgedPlugin {
  public let identifier = "WifiAccessPlugin"
  public let jsName = "WifiAccess"
  public let pluginMethods: [CAPPluginMethod] = [
    CAPPluginMethod(name: "getCurrentWifiConnection", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "scanAvailableWifiNetworks", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "getWifiScanSnapshot", returnType: CAPPluginReturnPromise),
    CAPPluginMethod(name: "requestWifiPermissionsIfNeeded", returnType: CAPPluginReturnPromise)
  ]

  @objc func getCurrentWifiConnection(_ call: CAPPluginCall) {
    fetchCurrentNetwork { payload in
      call.resolve(payload)
    }
  }

  @objc func scanAvailableWifiNetworks(_ call: CAPPluginCall) {
    // iOS does not expose a general nearby Wi-Fi scan list here.
    call.resolve([
      "availableNetworks": []
    ])
  }

  @objc func getWifiScanSnapshot(_ call: CAPPluginCall) {
    fetchCurrentNetwork { current in
      let hasCurrentSsid = current["ssid"] as? String != nil
      call.resolve([
        "current": current,
        "availableNetworks": [],
        "scannedAt": Int(Date().timeIntervalSince1970 * 1000),
        "platformSupport": [
          "platform": "ios",
          "canReadCurrentNetwork": hasCurrentSsid,
          "canScanNearbyNetworks": false,
          "message": hasCurrentSsid
            ? "Current Wi-Fi was read successfully on this iOS device."
            : "iOS only allows best-effort current Wi-Fi detection where the app has the required entitlement."
        ]
      ])
    }
  }

  @objc func requestWifiPermissionsIfNeeded(_ call: CAPPluginCall) {
    call.resolve([
      "permissionState": "unavailable",
      "granted": false,
      "message": "iOS does not offer a general Wi-Fi scan permission flow for this feature."
    ])
  }

  private func fetchCurrentNetwork(completion: @escaping ([String: Any]) -> Void) {
    guard #available(iOS 14.0, *) else {
      completion(buildConnectionPayload(ssid: nil, bssid: nil, connectionType: "unknown"))
      return
    }

    NEHotspotNetwork.fetchCurrent { network in
      let ssid = network?.ssid
      let bssid = network?.bssid
      let connectionType = ssid == nil ? "unknown" : "wifi"
      completion(self.buildConnectionPayload(ssid: ssid, bssid: bssid, connectionType: connectionType))
    }
  }

  private func buildConnectionPayload(ssid: String?, bssid: String?, connectionType: String) -> [String: Any] {
    return [
      "ssid": ssid as Any,
      "bssid": bssid as Any,
      "connectionType": connectionType,
      "isConnectedToWifi": connectionType == "wifi",
      "permissionState": "unavailable"
    ]
  }
}
