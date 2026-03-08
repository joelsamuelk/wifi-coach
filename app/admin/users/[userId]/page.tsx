"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Cpu, FolderKanban, ScanLine, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminEmptyState,
  DataTable,
  DetailPanel,
  KPIStatCard,
} from "@/components/admin";
import { DeviceCard } from "@/components/wifi/device-card";
import { SectionHeader, SurfaceCard } from "@/components/wifi/app-primitives";
import { ScoreBadge } from "@/components/wifi/score-badge";
import { useAdminData } from "@/lib/admin/useAdminData";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { dataset } = useAdminData();
  const user = dataset.users.find((entry) => entry.id === userId) ?? null;

  if (!user) {
    return (
      <AdminEmptyState
        icon={UserRound}
        title="User not found"
        description="This user record is not available in the local admin dataset."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/users">Back to Users</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Button asChild variant="outline" size="icon-sm">
          <Link href="/admin/users" aria-label="Back to users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-foreground">{user.name}</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Session-based user record for the current local profile.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPIStatCard icon={ScanLine} label="Scans" value={user.totalScans} />
        <KPIStatCard icon={FolderKanban} label="Diagnostics" value={user.totalDiagnostics} />
        <KPIStatCard icon={Cpu} label="Devices" value={user.devices.length} />
        <KPIStatCard
          icon={UserRound}
          label="Latest score"
          value={user.latestWifiScore ?? "None"}
          helper={user.latestScanAt ? format(user.latestScanAt, "MMM d, yyyy") : "No scans yet"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DetailPanel title="Profile summary">
          <div className="grid gap-3 md:grid-cols-2">
            <SurfaceCard className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                User ID
              </p>
              <p className="mt-2 font-medium text-foreground">{user.id}</p>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Platform
              </p>
              <p className="mt-2 font-medium text-foreground">{user.platform}</p>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Status
              </p>
              <p className="mt-2 font-medium text-foreground capitalize">{user.status}</p>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Email
              </p>
              <p className="mt-2 font-medium text-foreground">
                {user.email ?? "Not collected"}
              </p>
            </SurfaceCard>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Latest recommendations"
          subtitle="Most recent advice generated for this user."
        >
          {user.latestRecommendations.length > 0 ? (
            <div className="space-y-3">
              {user.latestRecommendations.slice(0, 3).map((recommendation) => (
                <SurfaceCard key={`${recommendation.problem}-${recommendation.fix}`} className="p-4">
                  <p className="font-semibold text-foreground">{recommendation.problem}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {recommendation.fix}
                  </p>
                </SurfaceCard>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              icon={FolderKanban}
              title="No recommendations yet"
              description="Recommendations will appear once scans are saved."
            />
          )}
        </DetailPanel>
      </div>

      <DetailPanel title="Recent scans">
        <DataTable
          rows={user.scans.slice(0, 5)}
          getRowKey={(scan) => scan.id}
          columns={[
            {
              key: "network",
              header: "Network",
              render: (scan) => scan.networkName,
            },
            {
              key: "created",
              header: "Created",
              render: (scan) => format(scan.createdAt, "MMM d, yyyy h:mm a"),
            },
            {
              key: "mode",
              header: "Mode",
              render: (scan) => scan.mode,
            },
            {
              key: "score",
              header: "Score",
              render: (scan) => (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{scan.homeScore}</span>
                  <ScoreBadge label={scan.homeLabel} />
                </div>
              ),
            },
          ]}
          empty={
            <AdminEmptyState
              icon={ScanLine}
              title="No scans yet"
              description="Scan activity will appear here once the user saves scans."
            />
          }
        />
      </DetailPanel>

      <div className="grid gap-4 xl:grid-cols-2">
        <DetailPanel title="Configured rooms">
          {user.rooms.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {user.rooms.map((room) => (
                <SurfaceCard key={room.id} className="p-4">
                  <p className="font-semibold text-foreground">{room.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {room.floor} • {room.type}
                  </p>
                </SurfaceCard>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              icon={FolderKanban}
              title="No rooms configured"
              description="Room setup will appear here once rooms are added in the consumer app."
            />
          )}
        </DetailPanel>

        <DetailPanel title="Device discovery results">
          {user.devices.length > 0 ? (
            <div className="space-y-3">
              {user.devices.slice(0, 3).map((device) => (
                <DeviceCard key={device.id} device={device} compact />
              ))}
            </div>
          ) : (
            <AdminEmptyState
              icon={Cpu}
              title="No devices available"
              description="Device discovery is unavailable in browser mode unless a supported provider is active."
            />
          )}
        </DetailPanel>
      </div>
    </div>
  );
}
