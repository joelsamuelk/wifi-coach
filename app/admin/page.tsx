"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertTriangle,
  Gauge,
  Router,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";
import {
  AdminBarChart,
  AdminDonutChart,
  AdminEmptyState,
  AdminLineChart,
  DetailPanel,
  KPIStatCard,
  StatusBadge,
  TrendCard,
} from "@/components/admin";
import { SurfaceCard } from "@/components/wifi/app-primitives";
import { useAdminData } from "@/lib/admin/useAdminData";

export default function AdminOverviewPage() {
  const { dataset } = useAdminData();

  return (
    <div className="flex flex-col gap-6">
      <DetailPanel
        title="Operational snapshot"
        subtitle="A calm executive view of current product activity, network quality, and support readiness."
        action={
          <StatusBadge
            label={dataset.source === "mock" ? "Preview dataset" : "Live local snapshot"}
            tone="info"
          />
        }
      >
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <KPIStatCard
              icon={Users}
              label="Total users"
              value={dataset.overview.totalUsers}
              helper="Profiles active in the current admin snapshot."
            />
            <KPIStatCard
              icon={Wifi}
              label="Total scans"
              value={dataset.overview.totalScans}
              helper="Saved room-by-room scan sessions."
            />
            <KPIStatCard
              icon={Gauge}
              label="Average WiFi score"
              value={dataset.overview.averageWifiScore || "0"}
              helper="Average home score across saved scans."
            />
            <KPIStatCard
              icon={Activity}
              label="Diagnostics run"
              value={dataset.overview.totalDiagnostics}
              helper="Fix My WiFi quick diagnostic sessions."
            />
            <KPIStatCard
              icon={AlertTriangle}
              label="Weak room rate"
              value={`${dataset.overview.weakRoomRate}%`}
              helper="Share of room results rated weak."
            />
            <KPIStatCard
              icon={Sparkles}
              label="Device discovery"
              value={`${dataset.overview.deviceDiscoverySupportRate}%`}
              helper={dataset.overview.deviceDiscoveryAvailability}
            />
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/70 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Recent operational notes
            </p>
            <div className="mt-4 space-y-3">
              {dataset.activityFeed.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                    </div>
                    <StatusBadge
                      label={item.type}
                      tone={
                        item.severity === "danger"
                          ? "danger"
                          : item.severity === "warning"
                            ? "warning"
                            : "info"
                      }
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DetailPanel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6">
          <TrendCard
            title="WiFi score trend"
            subtitle="Average home score over recent saved scans."
          >
            {dataset.scoreTrend.length > 0 ? (
              <AdminLineChart data={dataset.scoreTrend} color="#2563eb" />
            ) : (
              <AdminEmptyState
                icon={Gauge}
                title="No score trend yet"
                description="Saved scans will appear here once room-by-room scans are completed."
              />
            )}
          </TrendCard>

          <TrendCard
            title="Scan volume over time"
            subtitle="How often users are running scans across the current period."
          >
            {dataset.scanVolumeTrend.length > 0 ? (
              <AdminBarChart data={dataset.scanVolumeTrend} color="#0f9d92" />
            ) : (
              <AdminEmptyState
                icon={Wifi}
                title="No scan activity yet"
                description="Scan volume will populate here once sessions are saved."
              />
            )}
          </TrendCard>
        </div>

        <div className="grid gap-6">
          <TrendCard
            title="Most common weak rooms"
            subtitle="Areas that most often underperform."
          >
            {dataset.weakRooms.length > 0 ? (
              <AdminBarChart data={dataset.weakRooms} color="#ef4444" />
            ) : (
              <AdminEmptyState
                icon={Router}
                title="No weak rooms yet"
                description="Weak room patterns will appear once poorer room results are saved."
              />
            )}
          </TrendCard>

          <TrendCard
            title="Most common recommendations"
            subtitle="Which fixes are being suggested most often."
          >
            {dataset.recommendationCounts.length > 0 ? (
              <AdminDonutChart data={dataset.recommendationCounts.slice(0, 5)} />
            ) : (
              <AdminEmptyState
                icon={Sparkles}
                title="No recommendation data yet"
                description="Recommendation patterns will appear after scan sessions generate advice."
              />
            )}
          </TrendCard>

          <TrendCard
            title="Most frequent diagnostic problems"
            subtitle="Quick-diagnostic issues the team should keep an eye on."
          >
            {dataset.diagnosticBreakdown.length > 0 ? (
              <AdminBarChart data={dataset.diagnosticBreakdown} color="#f59e0b" />
            ) : (
              <AdminEmptyState
                icon={Activity}
                title="No diagnostics yet"
                description="Diagnostic problem patterns will appear here once Fix My WiFi is used."
              />
            )}
          </TrendCard>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DetailPanel
          title="Recent activity"
          subtitle="Latest scans, diagnostics, and noteworthy weak sessions."
        >
          <div className="space-y-3">
            {dataset.activityFeed.length > 0 ? (
              dataset.activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <StatusBadge
                    label={item.type}
                    tone={
                      item.severity === "danger"
                        ? "danger"
                        : item.severity === "warning"
                          ? "warning"
                          : "info"
                    }
                  />
                </div>
              ))
            ) : (
              <AdminEmptyState
                icon={Activity}
                title="No recent activity"
                description="Activity will begin to appear here as users run scans and diagnostics."
              />
            )}
          </div>
        </DetailPanel>

        <div className="grid gap-6">
          <DetailPanel
            title="Latest scans"
            subtitle="Most recently saved room-by-room scans."
          >
            <div className="space-y-3">
              {dataset.recentScans.length > 0 ? (
                dataset.recentScans.map((scan) => (
                  <SurfaceCard
                    key={scan.id}
                    className="rounded-[24px] border border-slate-200/70 bg-white px-4 py-4 shadow-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{scan.networkName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {scan.mode} mode · {scan.roomResults.length} rooms
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-slate-950">{scan.homeScore}</p>
                        <p className="text-xs text-slate-400">
                          {formatDistanceToNow(scan.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <StatusBadge
                        label={scan.homeLabel === "Weak" ? "Weak" : scan.homeLabel === "Fair" ? "Fair" : "Great"}
                        tone={
                          scan.homeLabel === "Weak"
                            ? "danger"
                            : scan.homeLabel === "Fair"
                              ? "warning"
                              : "success"
                        }
                      />
                      <p className="text-sm text-slate-500">{scan.summary}</p>
                    </div>
                  </SurfaceCard>
                ))
              ) : (
                <AdminEmptyState
                  icon={Wifi}
                  title="No scans yet"
                  description="The scan feed will appear here once the consumer app saves scan sessions."
                />
              )}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Recent issues"
            subtitle="Errors or weak sessions that may need attention."
          >
            {dataset.recentIssues.length > 0 ? (
              <div className="space-y-3">
                {dataset.recentIssues.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-rose-900">{item.title}</p>
                      <StatusBadge label="attention" tone="danger" />
                    </div>
                    <p className="mt-1 text-sm leading-6 text-rose-800/80">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                icon={AlertTriangle}
                title="No recent issues"
                description="Recent weak sessions or failures will appear here when they need review."
              />
            )}
          </DetailPanel>
        </div>
      </div>
    </div>
  );
}
