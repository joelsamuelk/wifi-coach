"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Download, ExternalLink, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminEmptyState,
  DataTable,
  DetailPanel,
  FilterBar,
  FilterLabel,
  StatusBadge,
} from "@/components/admin";
import { useAdminData } from "@/lib/admin/useAdminData";
import { scoreToLabel } from "@/lib/admin/selectors";
import { ScoreBadge } from "@/components/wifi/score-badge";

export default function AdminUsersPage() {
  const { dataset } = useAdminData();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState<"all" | "active" | "idle">("all");
  const [activity, setActivity] = useState<"all" | "7d" | "30d">("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(dataset.users[0]?.id ?? null);

  useEffect(() => {
    if (!selectedUserId && dataset.users[0]) {
      setSelectedUserId(dataset.users[0].id);
    }
  }, [dataset.users, selectedUserId]);

  const users = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return dataset.users.filter((user) => {
      if (
        normalized &&
        !user.name.toLowerCase().includes(normalized) &&
        !user.id.toLowerCase().includes(normalized) &&
        !(user.email ?? "").toLowerCase().includes(normalized)
      ) {
        return false;
      }

      if (platform !== "all" && user.platform !== platform) {
        return false;
      }

      if (status !== "all" && user.status !== status) {
        return false;
      }

      if (activity !== "all" && user.latestScanAt) {
        const days = activity === "7d" ? 7 : 30;
        if (Date.now() - user.latestScanAt > days * 24 * 60 * 60 * 1000) {
          return false;
        }
      }

      return activity === "all" || Boolean(user.latestScanAt);
    });
  }, [activity, dataset.users, platform, query, status]);

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0] ?? null;
  const platformOptions = [...new Set(dataset.users.map((user) => user.platform))];

  function exportUsers() {
    const lines = [
      ["User", "Email", "Platform", "Latest Scan", "Latest WiFi Score", "Status"].join(","),
      ...users.map((user) =>
        [
          user.name,
          user.email ?? "",
          user.platform,
          user.latestScanAt ? format(user.latestScanAt, "yyyy-MM-dd HH:mm") : "",
          user.latestWifiScore ?? "",
          user.status,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "wifi-coach-admin-users.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterBar className="justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search user, email, or session ID"
              className="border-slate-200 bg-slate-50 pl-9"
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <FilterLabel>Platform</FilterLabel>
            <select
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none"
            >
              <option value="all">All</option>
              {platformOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <FilterLabel>Status</FilterLabel>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "all" | "active" | "idle")}
              className="bg-transparent text-sm text-slate-700 outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <FilterLabel>Latest activity</FilterLabel>
            <select
              value={activity}
              onChange={(event) => setActivity(event.target.value as "all" | "7d" | "30d")}
              className="bg-transparent text-sm text-slate-700 outline-none"
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>
        <Button variant="outline" onClick={exportUsers} className="min-w-[132px]">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DataTable
          rows={users}
          getRowKey={(user) => user.id}
          selectedRowKey={selectedUser?.id ?? null}
          onRowClick={(user) => setSelectedUserId(user.id)}
          columns={[
            {
              key: "user",
              header: "User",
              render: (user) => (
                <div>
                  <p className="font-semibold text-slate-950">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.id}</p>
                </div>
              ),
            },
            {
              key: "email",
              header: "Email",
              render: (user) => user.email ?? "Not collected",
            },
            {
              key: "platform",
              header: "Platform",
              render: (user) => user.platform,
            },
            {
              key: "latestScan",
              header: "Latest scan",
              render: (user) =>
                user.latestScanAt ? format(user.latestScanAt, "MMM d, yyyy") : "No scans",
            },
            {
              key: "score",
              header: "Latest WiFi score",
              render: (user) =>
                user.latestWifiScore !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-950">{user.latestWifiScore}</span>
                    <ScoreBadge label={scoreToLabel(user.latestWifiScore)} />
                  </div>
                ) : (
                  "No score"
                ),
            },
            {
              key: "status",
              header: "Status",
              render: (user) => (
                <StatusBadge
                  label={user.status}
                  tone={user.status === "active" ? "success" : "neutral"}
                />
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (user) => (
                <Link
                  href={`/admin/users/${user.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ),
            },
          ]}
          empty={
            <AdminEmptyState
              icon={Users}
              title="No users matched"
              description="Try a different filter or wait for more user activity to appear."
            />
          }
        />

        <DetailPanel
          title={selectedUser ? selectedUser.name : "User details"}
          subtitle={
            selectedUser
              ? "Profile summary, latest activity, rooms, and recommendations."
              : "Select a user to inspect details."
          }
          action={
            selectedUser ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/users/${selectedUser.id}`}>Full profile</Link>
              </Button>
            ) : null
          }
        >
          {selectedUser ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoTile label="Email" value={selectedUser.email ?? "Not collected"} />
                <InfoTile label="Platform" value={selectedUser.platform} />
                <InfoTile
                  label="Latest scan"
                  value={
                    selectedUser.latestScanAt
                      ? format(selectedUser.latestScanAt, "MMM d, yyyy h:mm a")
                      : "No scans"
                  }
                />
                <InfoTile
                  label="Device discovery"
                  value={selectedUser.devices.length > 0 ? "Available" : "Unavailable"}
                />
              </div>

              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Recent scans
                </p>
                <div className="mt-3 space-y-3">
                  {selectedUser.scans.slice(0, 3).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{scan.networkName}</p>
                        <p className="text-xs text-slate-500">{scan.mode} · {scan.summary}</p>
                      </div>
                      <ScoreBadge label={scan.homeLabel} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Configured rooms
                  </p>
                  <div className="mt-3 space-y-2">
                    {selectedUser.rooms.slice(0, 4).map((room) => (
                      <div key={room.id} className="rounded-2xl bg-white px-3 py-2.5">
                        <p className="text-sm font-medium text-slate-950">{room.name}</p>
                        <p className="text-xs text-slate-500">
                          {room.floor} · {room.type}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Latest recommendations
                  </p>
                  <div className="mt-3 space-y-2">
                    {selectedUser.latestRecommendations.slice(0, 3).map((item) => (
                      <div
                        key={`${item.problem}-${item.fix}`}
                        className="rounded-2xl bg-white px-3 py-2.5"
                      >
                        <p className="text-sm font-medium text-slate-950">{item.problem}</p>
                        <p className="text-xs leading-5 text-slate-500">{item.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <AdminEmptyState
              icon={Users}
              title="No user selected"
              description="Choose a user from the table to inspect their latest product activity."
            />
          )}
        </DetailPanel>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200/70 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}
