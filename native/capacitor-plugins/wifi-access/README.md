# WifiAccess Capacitor Plugin

This scaffold adds a native bridge for WiFi Coach so a Capacitor mobile shell can:

- read the current Wi-Fi SSID on Android
- scan nearby Wi-Fi networks on Android
- attempt best-effort current Wi-Fi detection on iOS

The web app does not use this directly. The shared TypeScript Wi-Fi service in `lib/wifi/`
will automatically call `window.Capacitor.Plugins.WifiAccess` when the app is running in a
Capacitor native shell and this plugin is installed.

## Notes

- Android Wi-Fi scanning requires runtime permissions and location services.
- iOS does not support a general nearby Wi-Fi scan list here. The plugin only attempts current
  network detection where the platform allows it.
- This repo does not yet include generated `android/` or `ios/` Capacitor app projects. Install
  this plugin into those native shells when they are added.
