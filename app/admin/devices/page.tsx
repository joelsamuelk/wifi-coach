"use client";

import { Cpu, SearchCheck, Wifi } from "lucide-react";
import {
  AdminBarChart,
  AdminDonutChart,
  AdminEmptyState,
  DataTable,
  DetailPanel,
  KPIStatCard,
  StatusBadge,
  TrendCard,
} from "@/components/admin";
import { getDeviceTypeCopy } from "@/lib/devices";
import { useAdminData } from "@/lib/admin/useAdminData";

export default function AdminDevicesPage() {
  const { dataset } = useAdminData();
  const unsupported = dataset.deviceSupport && !dataset.deviceSupport.canDiscoverDevices;
  const weakCount = dataset.devices.filter((device) => device.signalLabel === "weak").length;
  const highLatencyCount = dataset.devices.filter((device) => (device.latencyMs ?? 0) > 80).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIStatCard
          icon={Cpu}
          label="Devices detected"
          value={dataset.devices.length}
          helper="Current snapshot from the active provider."
        />
        <KPIStatCard
          icon={SearchCheck}
          label="Weak devices"
          value={weakCount}
          helper="Devices with weak signal in the current environment."
        />
        <KPIStatCard
          icon={Wifi}
          label="High latency devices"
          value={highLatencyCount}
          helper="Devices that may affect streaming, calls, or gaming."
        />
        <KPIStatCard
          icon={Cpu}
          label="Discovery support rate"
          value={`${dataset.overview.deviceDiscoverySupportRate}%`}
          helper={dataset.deviceSupport?.discoveryMode ?? "unknown"}
        />
      </div>

      {unsupported ? (
        <DetailPanel
          title="Device discovery is not available in some app modes yet"
          subtitle="The admin layout is ready for future supported providers, but browser mode cannot enumerate local devices."
        >
          <AdminEmptyState
            icon={Cpu}
            title="Not available in browser mode"
            description={
              dataset.deviceSupport?.reason ??
              "Device discovery requires a supported local-bridge or native provider."
            }
          />
        </DetailPanel>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <TrendCard title="Device type distribution" subtitle="How the latest network mix is split by device type.">
              {dataset.deviceTypeDistribution.length > 0 ? (
                <AdminDonutChart data={dataset.deviceTypeDistribution} />
              ) : (
                <AdminEmptyState
                  icon={Cpu}
                  title="No device types yet"
                  description="Activate a supported discovery provider to populate device insights."
                />
              )}
            </TrendCard>

            <div className="grid gap-6">
              <TrendCard title="Weak device patterns" subtitle="Which devices most often look weak.">
                {dataset.weakDevicePatterns.length > 0 ? (
                  <AdminBarChart data={dataset.weakDevicePatterns} color="#ef4444" />
                ) : (
                  <AdminEmptyState
                    icon={SearchCheck}
                    title="No weak device patterns"
                    description="Weak device patterns will appear when device metrics are available."
                  />
                )}
              </TrendCard>

              <TrendCard title="High latency patterns" subtitle="Devices that may affect gaming or calls.">
                {dataset.highLatencyDevices.length > 0 ? (
                  <AdminBarChart data={dataset.highLatencyDevices} color="#f59e0b" />
                ) : (
                  <AdminEmptyState
                    icon={Wifi}
                    title="No high-latency devices"
                    description="Latency-heavy device patterns will appear when device measurements are available."
                  />
                )}
              </TrendCard>
            </div>
          </div>

          <DataTable
            rows={dataset.devices}
            getRowKey={(device) => device.id}
            columns={[
              {
                key: "name",
                header: "Device Name",
                render: (device) => (
                  <div>
                    <p className="font-semibold text-slate-950">{device.name}</p>
                    <p className="text-xs text-slate-500">{device.vendor ?? "Unknown vendor"}</p>
                  </div>
                ),
              },
              {
                key: "type",
                header: "Type",
                render: (device) => getDeviceTypeCopy(device.type),
              },
              {
                key: "status",
                header: "Status",
                render: (device) => (
                  <StatusBadge
                    label={device.status}
                    tone={device.status === "online" ? "success" : "neutral"}
                  />
                ),
              },
              {
                key: "signal",
                header: "Signal",
                render: (device) => (
                  <StatusBadge
                    label={device.signalLabel}
                    tone={
                      device.signalLabel === "weak"
                        ? "danger"
                        : device.signalLabel === "fair"
                          ? "warning"
                          : "success"
                    }
                  />
                ),
              },
              {
                key: "latency",
                header: "Latency",
                render: (device) => (device.latencyMs ? `${Math.round(device.latencyMs)} ms` : "—"),
              },
              {
                key: "support",
                header: "Network Support",
                render: () => dataset.deviceSupport?.discoveryMode ?? "unknown",
              },
              {
                key: "lastSeen",
                header: "Last Seen",
                render: (device) => new Date(device.discoveredAt).toLocaleTimeString(),
              },
            ]}
            empty={
              <AdminEmptyState
                icon={Cpu}
                title="No devices yet"
                description="Use a supported provider or admin mock mode to populate the device table."
              />
            }
          />
        </>
      )}
    </div>
  );
}
