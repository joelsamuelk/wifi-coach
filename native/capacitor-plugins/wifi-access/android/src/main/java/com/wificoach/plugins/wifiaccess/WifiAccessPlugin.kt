package com.wificoach.plugins.wifiaccess

import android.Manifest
import android.content.Context
import android.location.LocationManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.ScanResult
import android.net.wifi.WifiManager
import android.os.Build
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback

@CapacitorPlugin(
  name = "WifiAccess",
  permissions = [
    Permission(alias = "wifiState", strings = [Manifest.permission.ACCESS_WIFI_STATE]),
    Permission(
      alias = "location",
      strings = [Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION]
    ),
    Permission(alias = "nearbyWifi", strings = [Manifest.permission.NEARBY_WIFI_DEVICES])
  ]
)
class WifiAccessPlugin : Plugin() {
  private val wifiManager: WifiManager by lazy {
    context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
  }

  private val connectivityManager: ConnectivityManager by lazy {
    context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
  }

  private val locationManager: LocationManager by lazy {
    context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
  }

  @PluginMethod
  fun getCurrentWifiConnection(call: PluginCall) {
    call.resolve(buildCurrentConnection())
  }

  @PluginMethod
  fun scanAvailableWifiNetworks(call: PluginCall) {
    val payload = JSObject()
    payload.put("availableNetworks", buildAvailableNetworks())
    call.resolve(payload)
  }

  @PluginMethod
  fun getWifiScanSnapshot(call: PluginCall) {
    call.resolve(buildSnapshot())
  }

  @PluginMethod
  fun requestWifiPermissionsIfNeeded(call: PluginCall) {
    if (hasRequiredPermissions()) {
      call.resolve(buildPermissionResult("granted", true, "Wi-Fi permissions are already granted."))
      return
    }

    requestPermissionForAliases(requiredAliases(), call, "permissionsCallback")
  }

  @PermissionCallback
  private fun permissionsCallback(call: PluginCall) {
    val granted = hasRequiredPermissions()
    val state = if (granted) "granted" else derivePermissionState()
    val message = if (granted) {
      "Wi-Fi permissions granted."
    } else {
      "Allow Wi-Fi and location permissions to read Wi-Fi details on Android."
    }
    call.resolve(buildPermissionResult(state, granted, message))
  }

  private fun buildSnapshot(): JSObject {
    val current = buildCurrentConnection()
    val canReadCurrent = canReadCurrentNetwork()
    val canScanNearby = canScanNearbyNetworks()
    val snapshot = JSObject()
    snapshot.put("current", current)
    snapshot.put("availableNetworks", if (canScanNearby) buildAvailableNetworks() else JSArray())
    snapshot.put("scannedAt", System.currentTimeMillis())
    snapshot.put(
      "platformSupport",
      JSObject().apply {
        put("platform", "android")
        put("canReadCurrentNetwork", canReadCurrent)
        put("canScanNearbyNetworks", canScanNearby)
        put("message", buildSupportMessage(canReadCurrent, canScanNearby))
      }
    )
    return snapshot
  }

  private fun buildCurrentConnection(): JSObject {
    val network = connectivityManager.activeNetwork
    val capabilities = connectivityManager.getNetworkCapabilities(network)
    val connectionType = when {
      capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true -> "wifi"
      capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) == true -> "cellular"
      capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) == true -> "ethernet"
      else -> "unknown"
    }

    val connectedToWifi = connectionType == "wifi" && wifiManager.isWifiEnabled
    val info = wifiManager.connectionInfo
    val ssid = if (connectedToWifi && canReadCurrentNetwork()) sanitizeSsid(info?.ssid) else null
    val bssid = if (connectedToWifi && canReadCurrentNetwork()) sanitizeBssid(info?.bssid) else null

    return JSObject().apply {
      put("ssid", ssid)
      put("bssid", bssid)
      put("connectionType", connectionType)
      put("isConnectedToWifi", connectedToWifi)
      put("permissionState", derivePermissionState())
    }
  }

  private fun buildAvailableNetworks(): JSArray {
    val results = JSArray()
    if (!canScanNearbyNetworks()) {
      return results
    }

    val currentSsid = sanitizeSsid(wifiManager.connectionInfo?.ssid)
    val currentBssid = sanitizeBssid(wifiManager.connectionInfo?.bssid)

    try {
      wifiManager.startScan()
    } catch (_: Exception) {
      // Android can throttle scans. Returning the last known scan results is still useful.
    }

    val scanResults = wifiManager.scanResults ?: emptyList<ScanResult>()
    scanResults
      .filter { it.SSID?.isNotBlank() == true }
      .sortedByDescending { it.level }
      .forEach { result ->
        results.put(
          JSObject().apply {
            put("ssid", result.SSID)
            put("bssid", sanitizeBssid(result.BSSID))
            put("signalLevel", WifiManager.calculateSignalLevel(result.level, 5))
            put("frequency", result.frequency)
            put("security", parseSecurity(result.capabilities))
            put("isCurrent", result.SSID == currentSsid || sanitizeBssid(result.BSSID) == currentBssid)
          }
        )
      }

    return results
  }

  private fun requiredAliases(): Array<String> {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      arrayOf("wifiState", "location", "nearbyWifi")
    } else {
      arrayOf("wifiState", "location")
    }
  }

  private fun hasRequiredPermissions(): Boolean {
    return requiredAliases().all { alias ->
      getPermissionState(alias) == PermissionState.GRANTED
    }
  }

  private fun canReadCurrentNetwork(): Boolean {
    return wifiManager.isWifiEnabled && hasRequiredPermissions() && isLocationEnabled()
  }

  private fun canScanNearbyNetworks(): Boolean {
    return wifiManager.isWifiEnabled && hasRequiredPermissions() && isLocationEnabled()
  }

  private fun isLocationEnabled(): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      locationManager.isLocationEnabled
    } else {
      locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
        locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
    }
  }

  private fun derivePermissionState(): String {
    if (hasRequiredPermissions()) {
      return "granted"
    }

    return requiredAliases()
      .map { getPermissionState(it).toString().lowercase() }
      .firstOrNull { state -> state.contains("denied") }
      ?.let { "denied" }
      ?: "prompt"
  }

  private fun buildSupportMessage(canReadCurrent: Boolean, canScanNearby: Boolean): String {
    if (!wifiManager.isWifiEnabled) {
      return "Wi-Fi is turned off on this device."
    }
    if (!isLocationEnabled()) {
      return "Location access is required on this device to read Wi-Fi details."
    }
    if (!hasRequiredPermissions()) {
      return "Allow Wi-Fi and location permissions to see available networks."
    }
    if (!canReadCurrent && !canScanNearby) {
      return "Wi-Fi details are not currently available."
    }
    return "Wi-Fi details are available on this Android device."
  }

  private fun buildPermissionResult(state: String, granted: Boolean, message: String): JSObject {
    return JSObject().apply {
      put("permissionState", state)
      put("granted", granted)
      put("message", message)
    }
  }

  private fun sanitizeSsid(rawSsid: String?): String? {
    val ssid = rawSsid?.removePrefix("\"")?.removeSuffix("\"")
    return if (ssid.isNullOrBlank() || ssid == "<unknown ssid>") null else ssid
  }

  private fun sanitizeBssid(rawBssid: String?): String? {
    return if (rawBssid.isNullOrBlank() || rawBssid == "02:00:00:00:00:00") null else rawBssid
  }

  private fun parseSecurity(capabilities: String?): String? {
    if (capabilities.isNullOrBlank()) {
      return null
    }
    return when {
      capabilities.contains("WPA3") -> "WPA3"
      capabilities.contains("WPA2") -> "WPA2"
      capabilities.contains("WPA") -> "WPA"
      capabilities.contains("WEP") -> "WEP"
      else -> "Open"
    }
  }
}
