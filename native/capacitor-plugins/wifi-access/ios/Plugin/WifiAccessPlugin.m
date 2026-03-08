#import <Capacitor/Capacitor.h>

CAP_PLUGIN(WifiAccessPlugin, "WifiAccess",
  CAP_PLUGIN_METHOD(getCurrentWifiConnection, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(scanAvailableWifiNetworks, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getWifiScanSnapshot, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(requestWifiPermissionsIfNeeded, CAPPluginReturnPromise);
)
