"use client";

import { Activity, ChartColumn, Gauge, MapPinned } from "lucide-react";
import {
  AdminBarChart,
  AdminDonutChart,
  AdminEmptyState,
  AdminLineChart,
  KPIStatCard,
  TrendCard,
} from "@/components/admin";
import { useAdminData } from "@/lib/admin/useAdminData";

export default function AdminAnalyticsPage() {
  const { dataset } = useAdminData();
  const improvement =
    dataset.scans.length > 1
      ? dataset.scans[0].homeScore - dataset.scans[dataset.scans.length - 1].homeScore
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIStatCard
          icon={Gauge}
          label="Scan completion rate"
          value={`${dataset.scanCompletion.completionRate}%`}
          helper="Share of room results with captured samples."
        />
        <KPIStatCard
          icon={MapPinned}
          label="Weak room trend"
          value={dataset.weakRooms[0]?.label ?? "Stable"}
          helper="Most frequently weak room in the current period."
        />
        <KPIStatCard
          icon={Activity}
          label="Recommendation types"
          value={dataset.recommendationCounts.length}
          helper="Distinct recommendation problem categories."
        />
        <KPIStatCard
          icon={ChartColumn}
          label="Score improvement after rescan"
          value={`${improvement > 0 ? "+" : ""}${improvement}`}
          helper="Difference between the oldest and most recent saved score."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendCard title="WiFi score distribution" subtitle="How saved scans are distributed by quality band.">
          {dataset.scoreDistribution.some((entry) => entry.value > 0) ? (
            <AdminDonutChart data={dataset.scoreDistribution} />
          ) : (
            <AdminEmptyState
              icon={ChartColumn}
              title="No score distribution yet"
              description="Save scan sessions to start building analytics."
            />
          )}
        </TrendCard>

        <TrendCard title="Score trend" subtitle="Average home score over time.">
          {dataset.scoreTrend.length > 0 ? (
            <AdminLineChart data={dataset.scoreTrend} color="#2563eb" />
          ) : (
            <AdminEmptyState
              icon={Gauge}
              title="No trend yet"
              description="Score trends will appear after scans are saved."
            />
          )}
        </TrendCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendCard title="Most common recommendations" subtitle="Recommendation themes across recent scans.">
          {dataset.recommendationCounts.length > 0 ? (
            <AdminBarChart data={dataset.recommendationCounts} color="#0f9d92" />
          ) : (
            <AdminEmptyState
              icon={Activity}
              title="No recommendation data"
              description="Recommendation patterns will appear after scans generate advice."
            />
          )}
        </TrendCard>

        <TrendCard title="Diagnostics breakdown" subtitle="How quick-diagnostic issues are distributed.">
          {dataset.diagnosticsByStatus.length > 0 ? (
            <AdminDonutChart data={dataset.diagnosticsByStatus} />
          ) : (
            <AdminEmptyState
              icon={Activity}
              title="No diagnostics yet"
              description="Diagnostics breakdown will populate once Fix My WiFi is used."
            />
          )}
        </TrendCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendCard title="Weak room heat trend" subtitle="Rooms that most often score weak.">
          {dataset.weakRooms.length > 0 ? (
            <AdminBarChart data={dataset.weakRooms} color="#ef4444" />
          ) : (
            <AdminEmptyState
              icon={MapPinned}
              title="No weak room data"
              description="Weak room trends will appear when scans capture weaker room performance."
            />
          )}
        </TrendCard>

        <TrendCard title="Room scan drop-off points" subtitle="Where users are most likely to abandon or skip.">
          {dataset.roomDropOffs.length > 0 ? (
            <AdminBarChart data={dataset.roomDropOffs} color="#64748b" />
          ) : (
            <AdminEmptyState
              icon={MapPinned}
              title="No drop-off data"
              description="Drop-off analytics will appear when room scans are skipped or interrupted."
            />
          )}
        </TrendCard>
      </div>
    </div>
  );
}
