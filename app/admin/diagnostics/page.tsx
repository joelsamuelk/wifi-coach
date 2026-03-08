"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Activity, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AdminEmptyState,
  DataTable,
  DetailPanel,
  FilterBar,
  FilterLabel,
  StatusBadge,
} from "@/components/admin";
import { getSeverityFromDiagnostic, withinDateRange } from "@/lib/admin/selectors";
import { useAdminData } from "@/lib/admin/useAdminData";

export default function AdminDiagnosticsPage() {
  const { dataset } = useAdminData();
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d">("all");
  const [severity, setSeverity] = useState<"all" | "great" | "fair" | "weak">("all");
  const [issueType, setIssueType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(dataset.diagnostics[0]?.id ?? null);

  useEffect(() => {
    if (!selectedId && dataset.diagnostics[0]) {
      setSelectedId(dataset.diagnostics[0].id);
    }
  }, [dataset.diagnostics, selectedId]);

  const issueOptions = useMemo(
    () => [...new Set(dataset.diagnostics.map((diagnostic) => diagnostic.problem))],
    [dataset.diagnostics],
  );

  const statusOptions = useMemo(
    () => [...new Set(dataset.diagnostics.map((diagnostic) => diagnostic.status))],
    [dataset.diagnostics],
  );

  const diagnostics = useMemo(
    () =>
      dataset.diagnostics.filter((diagnostic) => {
        const normalized = query.trim().toLowerCase();
        if (
          normalized &&
          !diagnostic.problem.toLowerCase().includes(normalized) &&
          !diagnostic.cause.toLowerCase().includes(normalized)
        ) {
          return false;
        }
        if (!withinDateRange(diagnostic.createdAt, dateRange)) {
          return false;
        }
        if (issueType !== "all" && diagnostic.problem !== issueType) {
          return false;
        }
        if (status !== "all" && diagnostic.status !== status) {
          return false;
        }
        if (severity !== "all" && getSeverityFromDiagnostic(diagnostic) !== severity) {
          return false;
        }
        return true;
      }),
    [dataset.diagnostics, dateRange, issueType, query, severity, status],
  );

  const selected = diagnostics.find((diagnostic) => diagnostic.id === selectedId) ?? diagnostics[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <FilterBar>
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search issue type or likely cause"
            className="border-slate-200 bg-slate-50 pl-9"
          />
        </div>
        <SelectFilter label="Date" value={dateRange} onChange={setDateRange}>
          <option value="all">All dates</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </SelectFilter>
        <SelectFilter label="Issue" value={issueType} onChange={setIssueType}>
          <option value="all">All issues</option>
          {issueOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectFilter>
        <SelectFilter label="Severity" value={severity} onChange={setSeverity}>
          <option value="all">All severity</option>
          <option value="great">Great</option>
          <option value="fair">Fair</option>
          <option value="weak">Weak</option>
        </SelectFilter>
        <SelectFilter label="Status" value={status} onChange={setStatus}>
          <option value="all">All status</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectFilter>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DataTable
          rows={diagnostics}
          getRowKey={(diagnostic) => diagnostic.id}
          selectedRowKey={selected?.id ?? null}
          onRowClick={(diagnostic) => setSelectedId(diagnostic.id)}
          columns={[
            {
              key: "createdAt",
              header: "Timestamp",
              render: (diagnostic) => format(diagnostic.createdAt, "MMM d, yyyy h:mm a"),
            },
            {
              key: "status",
              header: "Status",
              render: (diagnostic) => (
                <StatusBadge
                  label={diagnostic.status}
                  tone={
                    diagnostic.status === "Great WiFi"
                      ? "success"
                      : diagnostic.status === "Fair Coverage"
                        ? "warning"
                        : "danger"
                  }
                />
              ),
            },
            {
              key: "problem",
              header: "Problem",
              render: (diagnostic) => (
                <div>
                  <p className="font-semibold text-slate-950">{diagnostic.problem}</p>
                  <p className="text-xs text-slate-500">{diagnostic.cause}</p>
                </div>
              ),
            },
            {
              key: "fix",
              header: "Fix",
              render: (diagnostic) => diagnostic.fix,
            },
            {
              key: "metrics",
              header: "Metrics",
              render: (diagnostic) => (
                <div className="space-y-1 text-xs text-slate-500">
                  <p>Latency {Math.round(diagnostic.latencyMs)} ms</p>
                  <p>Down {Math.round(diagnostic.downloadMbps)} Mbps</p>
                  <p>Up {Math.round(diagnostic.uploadMbps)} Mbps</p>
                  <p>Loss {diagnostic.packetLossPct.toFixed(1)}%</p>
                </div>
              ),
            },
          ]}
          empty={
            <AdminEmptyState
              icon={Activity}
              title="No diagnostics match"
              description="Try a different filter or run Fix My WiFi to generate more data."
            />
          }
        />

        <DetailPanel
          title={selected ? selected.problem : "Diagnostic details"}
          subtitle={
            selected
              ? `${selected.status} · ${format(selected.createdAt, "MMM d, yyyy h:mm a")}`
              : "Select a diagnostic run to inspect details."
          }
        >
          {selected ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricTile label="Latency" value={`${Math.round(selected.latencyMs)} ms`} />
                <MetricTile label="Download" value={`${Math.round(selected.downloadMbps)} Mbps`} />
                <MetricTile label="Upload" value={`${Math.round(selected.uploadMbps)} Mbps`} />
                <MetricTile label="Packet loss" value={`${selected.packetLossPct.toFixed(1)}%`} />
              </div>

              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Full summary
                </p>
                <div className="mt-3 space-y-3 text-sm leading-6">
                  <SummaryRow label="Problem" value={selected.problem} />
                  <SummaryRow label="Cause" value={selected.cause} />
                  <SummaryRow label="Fix" value={selected.fix} />
                  <SummaryRow label="Expected improvement" value={selected.expectedImprovement} />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  User / session association
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p>Profile: {dataset.users[0]?.name ?? "Local profile"}</p>
                  <p>Session type: Fix My WiFi diagnostic</p>
                  <p>Latest related network: {dataset.scans[0]?.networkName ?? "Unknown"}</p>
                </div>
              </div>
            </div>
          ) : (
            <AdminEmptyState
              icon={Activity}
              title="No diagnostic selected"
              description="Choose a diagnostic run from the list to inspect its full summary."
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

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200/70 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-slate-950">{value}</p>
    </div>
  );
}
