"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink, Search, Wifi } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AdminEmptyState,
  DataTable,
  DetailPanel,
  FilterBar,
  FilterLabel,
  StatusBadge,
} from "@/components/admin";
import { ScoreBadge } from "@/components/wifi/score-badge";
import { getScanBand, withinDateRange } from "@/lib/admin/selectors";
import { useAdminData } from "@/lib/admin/useAdminData";

export default function AdminScansPage() {
  const { dataset } = useAdminData();
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d">("all");
  const [mode, setMode] = useState<"all" | "Quick" | "Deep">("all");
  const [scoreBand, setScoreBand] = useState<"all" | "great" | "fair" | "weak">("all");
  const [roomCount, setRoomCount] = useState<"all" | "small" | "large">("all");
  const [weakOnly, setWeakOnly] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(dataset.scans[0]?.id ?? null);

  useEffect(() => {
    if (!selectedScanId && dataset.scans[0]) {
      setSelectedScanId(dataset.scans[0].id);
    }
  }, [dataset.scans, selectedScanId]);

  const scans = useMemo(
    () =>
      dataset.scans.filter((scan) => {
        const normalized = query.trim().toLowerCase();
        if (
          normalized &&
          !scan.networkName.toLowerCase().includes(normalized) &&
          !scan.id.toLowerCase().includes(normalized)
        ) {
          return false;
        }
        if (!withinDateRange(scan.createdAt, dateRange)) {
          return false;
        }
        if (mode !== "all" && scan.mode !== mode) {
          return false;
        }
        if (scoreBand !== "all" && getScanBand(scan.homeScore) !== scoreBand) {
          return false;
        }
        if (roomCount === "small" && scan.roomResults.length > 3) {
          return false;
        }
        if (roomCount === "large" && scan.roomResults.length <= 3) {
          return false;
        }
        if (weakOnly && scan.homeScore >= 55) {
          return false;
        }
        return true;
      }),
    [dataset.scans, dateRange, mode, query, roomCount, scoreBand, weakOnly],
  );

  const selectedScan = scans.find((scan) => scan.id === selectedScanId) ?? scans[0] ?? null;
  const selectedIndex = dataset.scans.findIndex((scan) => scan.id === selectedScan?.id);
  const previousScan = selectedIndex >= 0 ? dataset.scans[selectedIndex + 1] ?? null : null;

  return (
    <div className="flex flex-col gap-6">
      <FilterBar>
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search network name or scan ID"
            className="border-slate-200 bg-slate-50 pl-9"
          />
        </div>
        <SelectFilter label="Date range" value={dateRange} onChange={setDateRange}>
          <option value="all">All dates</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </SelectFilter>
        <SelectFilter label="Mode" value={mode} onChange={setMode}>
          <option value="all">All modes</option>
          <option value="Quick">Quick</option>
          <option value="Deep">Deep</option>
        </SelectFilter>
        <SelectFilter label="Score band" value={scoreBand} onChange={setScoreBand}>
          <option value="all">All</option>
          <option value="great">Great</option>
          <option value="fair">Fair</option>
          <option value="weak">Weak</option>
        </SelectFilter>
        <SelectFilter label="Room count" value={roomCount} onChange={setRoomCount}>
          <option value="all">All</option>
          <option value="small">1 to 3 rooms</option>
          <option value="large">4+ rooms</option>
        </SelectFilter>
        <button
          type="button"
          onClick={() => setWeakOnly((current) => !current)}
          className={`inline-flex h-11 items-center rounded-2xl border px-4 text-sm font-medium transition-colors ${
            weakOnly
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          Weak scans only
        </button>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <DataTable
          rows={scans}
          getRowKey={(scan) => scan.id}
          selectedRowKey={selectedScan?.id ?? null}
          onRowClick={(scan) => setSelectedScanId(scan.id)}
          columns={[
            {
              key: "scan",
              header: "Scan ID",
              render: (scan) => (
                <div>
                  <p className="font-semibold text-slate-950">{scan.id}</p>
                  <p className="text-xs text-slate-500">{scan.networkName}</p>
                </div>
              ),
            },
            {
              key: "date",
              header: "Date",
              render: (scan) => format(scan.createdAt, "MMM d, yyyy h:mm a"),
            },
            {
              key: "mode",
              header: "Mode",
              render: (scan) => scan.mode,
            },
            {
              key: "rooms",
              header: "Rooms",
              render: (scan) => scan.roomResults.length,
            },
            {
              key: "score",
              header: "Home score",
              render: (scan) => (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-950">{scan.homeScore}</span>
                  <ScoreBadge label={scan.homeLabel} />
                </div>
              ),
            },
            {
              key: "delta",
              header: "Delta vs previous",
              render: (scan) => {
                const index = dataset.scans.findIndex((entry) => entry.id === scan.id);
                const previous = index >= 0 ? dataset.scans[index + 1] ?? null : null;
                const delta = previous ? scan.homeScore - previous.homeScore : null;

                if (delta === null) {
                  return "—";
                }

                return (
                  <span
                    className={
                      delta > 0
                        ? "font-semibold text-emerald-700"
                        : delta < 0
                          ? "font-semibold text-rose-700"
                          : "text-slate-500"
                    }
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                );
              },
            },
            {
              key: "action",
              header: "Action",
              render: (scan) => (
                <Link
                  href={`/admin/scans/${scan.id}`}
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
              icon={Wifi}
              title="No scans match"
              description="Adjust the filters or wait for more scan sessions to be saved."
            />
          }
        />

        <DetailPanel
          title={selectedScan ? selectedScan.networkName : "Scan details"}
          subtitle={
            selectedScan
              ? `${selectedScan.mode} scan · ${selectedScan.roomResults.length} rooms · ${format(
                  selectedScan.createdAt,
                  "MMM d, yyyy h:mm a",
                )}`
              : "Select a scan to inspect room-level results."
          }
          action={
            selectedScan ? (
              <ButtonLink href={`/admin/scans/${selectedScan.id}`}>Full breakdown</ButtonLink>
            ) : null
          }
        >
          {selectedScan ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoTile label="Home score" value={`${selectedScan.homeScore}`} />
                <InfoTile label="Label" value={selectedScan.homeLabel} />
                <InfoTile
                  label="Delta"
                  value={
                    previousScan
                      ? `${selectedScan.homeScore - previousScan.homeScore > 0 ? "+" : ""}${
                          selectedScan.homeScore - previousScan.homeScore
                        }`
                      : "—"
                  }
                />
              </div>

              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Summary
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{selectedScan.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedScan.recommendations.slice(0, 3).map((item) => (
                    <StatusBadge key={`${item.problem}-${item.fix}`} label={item.problem} tone="info" />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {selectedScan.roomResults.map((result) => {
                  const room = dataset.rooms.find((entry) => entry.id === result.roomId);
                  return (
                    <div
                      key={result.roomId}
                      className="rounded-[24px] border border-slate-200/70 bg-white px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {room?.name ?? "Unknown room"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{result.topIssue}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-950">{result.score}</span>
                          <ScoreBadge label={result.label} />
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <InfoTile label="Samples" value={`${result.samples.length}`} />
                        <InfoTile label="Issues" value={`${result.issues.length}`} />
                        <InfoTile label="Recommendation" value={result.recommendationSummary} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <AdminEmptyState
              icon={Wifi}
              title="No scan selected"
              description="Choose a scan from the table to inspect its room-by-room breakdown."
            />
          )}
        </DetailPanel>
      </div>
    </div>
  );
}

function SelectFilter<T extends string>({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <FilterLabel>{label}</FilterLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="bg-transparent text-sm text-slate-700 outline-none"
      >
        {children}
      </select>
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

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
    >
      {children}
    </Link>
  );
}
