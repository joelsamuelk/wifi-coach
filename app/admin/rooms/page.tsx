"use client";

import { Activity, BedDouble, BriefcaseBusiness, MapPinned } from "lucide-react";
import {
  AdminBarChart,
  AdminEmptyState,
  DataTable,
  KPIStatCard,
  TrendCard,
} from "@/components/admin";
import { useAdminData } from "@/lib/admin/useAdminData";

export default function AdminRoomsPage() {
  const { dataset } = useAdminData();
  const bedroomScore =
    dataset.avgScoreByRoomType.find((item) => item.label === "Bedroom")?.value ?? 0;
  const officeScore =
    dataset.avgScoreByRoomType.find((item) => item.label === "Office")?.value ?? 0;
  const upstairsWeakRate =
    dataset.avgScoreByFloor.find((item) => item.label === "Upstairs")?.value ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIStatCard
          icon={MapPinned}
          label="Most scanned room type"
          value={dataset.roomInsights[0]?.label ?? "None"}
          helper="Highest sample volume across room categories."
        />
        <KPIStatCard
          icon={BedDouble}
          label="Average bedroom score"
          value={bedroomScore || "0"}
          helper="Typical bedroom performance across saved scans."
        />
        <KPIStatCard
          icon={BriefcaseBusiness}
          label="Average office score"
          value={officeScore || "0"}
          helper="Workspace quality across recent scans."
        />
        <KPIStatCard
          icon={Activity}
          label="Weak upstairs room rate"
          value={`${dataset.roomInsights.find((item) => item.label === "Bedroom")?.weakRate ?? upstairsWeakRate}%`}
          helper="Where upstairs rooms are still underperforming."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendCard title="Room type distribution" subtitle="Configured room mix across the product.">
          {dataset.roomTypeDistribution.length > 0 ? (
            <AdminBarChart data={dataset.roomTypeDistribution} color="#2563eb" />
          ) : (
            <AdminEmptyState
              icon={MapPinned}
              title="No room data yet"
              description="Room distribution will appear here once rooms are configured."
            />
          )}
        </TrendCard>

        <TrendCard title="Weak room frequency" subtitle="Rooms that most often show weak performance.">
          {dataset.weakRooms.length > 0 ? (
            <AdminBarChart data={dataset.weakRooms} color="#ef4444" />
          ) : (
            <AdminEmptyState
              icon={Activity}
              title="No weak room trends yet"
              description="Weak room frequency will appear once scans detect weaker areas."
            />
          )}
        </TrendCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendCard title="Average score by room type" subtitle="Which room categories perform best.">
          {dataset.avgScoreByRoomType.length > 0 ? (
            <AdminBarChart data={dataset.avgScoreByRoomType} color="#0f9d92" />
          ) : (
            <AdminEmptyState
              icon={BedDouble}
              title="No score data yet"
              description="Average room scores will appear after room scan sessions are saved."
            />
          )}
        </TrendCard>

        <TrendCard title="Average score by floor" subtitle="How each floor of the home is performing overall.">
          {dataset.avgScoreByFloor.length > 0 ? (
            <AdminBarChart data={dataset.avgScoreByFloor} color="#64748b" />
          ) : (
            <AdminEmptyState
              icon={MapPinned}
              title="No floor performance yet"
              description="Floor-level scoring will appear once enough room results are available."
            />
          )}
        </TrendCard>
      </div>

      <DataTable
        rows={dataset.roomInsights}
        getRowKey={(row) => row.label}
        columns={[
          {
            key: "type",
            header: "Room Type",
            render: (row) => row.label,
          },
          {
            key: "score",
            header: "Avg Score",
            render: (row) => row.avgScore,
          },
          {
            key: "weakRate",
            header: "Weak Rate",
            render: (row) => `${row.weakRate}%`,
          },
          {
            key: "issues",
            header: "Common Issues",
            render: (row) => row.commonIssue,
          },
        ]}
        empty={
          <AdminEmptyState
            icon={MapPinned}
            title="No room insight rows yet"
            description="Room analytics will appear once enough scan history exists."
          />
        }
      />
    </div>
  );
}
