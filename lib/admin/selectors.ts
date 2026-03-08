import { format } from "date-fns";
import { getDeviceTypeCopy } from "@/lib/devices";
import type { DeviceDiscoverySupport, DiscoveredDevice } from "@/lib/devices";
import {
  getStatusLabel,
  type AppSettings,
  type QuickDiagnosticResult,
  type Room,
  type RoomScanResult,
  type ScanSession,
  type WiFiLabel,
} from "@/lib/types";
import type {
  AdminActivityItem,
  AdminDataset,
  AdminOverviewMetrics,
  AdminRoomInsight,
  AdminUserRecord,
  TrendDatum,
} from "./types";

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function toPercent(value: number, total: number) {
  if (total === 0) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
}

function averageByLabel<T>(items: T[], getKey: (item: T) => string, getValue: (item: T) => number) {
  const buckets = new Map<string, number[]>();
  items.forEach((item) => {
    const key = getKey(item);
    buckets.set(key, [...(buckets.get(key) ?? []), getValue(item)]);
  });
  return [...buckets.entries()].map(([label, values]) => ({
    label,
    value: Math.round(average(values)),
  }));
}

function topCounts(counts: Map<string, number>, limit = 5): TrendDatum[] {
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function topIssue(issues: string[]) {
  const sorted = topCounts(countBy(issues, (issue) => issue), 1);
  return sorted[0]?.label ?? "No common issue yet";
}

function toneForDiagnostic(diagnostic: QuickDiagnosticResult): AdminActivityItem["severity"] {
  if (diagnostic.status === "Weak Signal") {
    return "danger";
  }
  if (diagnostic.status === "Fair Coverage") {
    return "warning";
  }
  return "info";
}

function toneForScan(scan: ScanSession): AdminActivityItem["severity"] {
  if (scan.homeScore < 55) {
    return "danger";
  }
  if (scan.homeScore < 75) {
    return "warning";
  }
  return "info";
}

export function buildAdminUsers(input: {
  scans: ScanSession[];
  diagnostics: QuickDiagnosticResult[];
  rooms: Room[];
  settings: AppSettings;
  devices: DiscoveredDevice[];
  users?: AdminUserRecord[];
}): AdminUserRecord[] {
  if (input.users && input.users.length > 0) {
    return input.users;
  }

  const latestScan = input.scans[0] ?? null;

  return [
    {
      id: "local-user",
      name: input.settings.profileName || "Local User",
      email: null,
      platform: "Web",
      status: input.scans.length > 0 || input.diagnostics.length > 0 ? "active" : "idle",
      latestScanAt: latestScan?.createdAt ?? null,
      latestWifiScore: latestScan?.homeScore ?? null,
      totalScans: input.scans.length,
      totalDiagnostics: input.diagnostics.length,
      rooms: input.rooms,
      scans: input.scans,
      diagnostics: input.diagnostics,
      devices: input.devices,
      latestRecommendations: latestScan?.recommendations ?? [],
    },
  ];
}

export function buildAdminOverview(input: {
  scans: ScanSession[];
  diagnostics: QuickDiagnosticResult[];
  deviceSupport: DeviceDiscoverySupport | null;
  users: AdminUserRecord[];
}): AdminOverviewMetrics {
  const totalRoomResults = input.scans.reduce(
    (total, scan) => total + scan.roomResults.length,
    0,
  );
  const weakRooms = input.scans.reduce(
    (total, scan) =>
      total + scan.roomResults.filter((room) => room.label === "Weak").length,
    0,
  );
  const supportedUsers = input.users.filter((user) => user.devices.length > 0).length;
  const supportRate = input.users.length > 0 ? toPercent(supportedUsers, input.users.length) : 0;

  return {
    totalUsers: input.users.length,
    totalScans: input.scans.length,
    averageWifiScore: Math.round(average(input.scans.map((scan) => scan.homeScore))),
    totalDiagnostics: input.diagnostics.length,
    weakRoomRate: toPercent(weakRooms, totalRoomResults),
    deviceDiscoveryAvailability: input.deviceSupport?.canDiscoverDevices
      ? `Available (${input.deviceSupport.discoveryMode})`
      : "Browser mode only",
    deviceDiscoverySupportRate: input.deviceSupport?.canDiscoverDevices ? Math.max(supportRate, 100) : supportRate,
  };
}

function buildRoomInsights(input: { scans: ScanSession[]; rooms: Room[] }): AdminRoomInsight[] {
  const resultsByRoomType = new Map<string, RoomScanResult[]>();

  input.scans.forEach((scan) => {
    scan.roomResults.forEach((result) => {
      const room = input.rooms.find((entry) => entry.id === result.roomId);
      const key = room?.type ?? "Unknown";
      resultsByRoomType.set(key, [...(resultsByRoomType.get(key) ?? []), result]);
    });
  });

  return [...resultsByRoomType.entries()]
    .map(([label, results]) => ({
      label,
      avgScore: Math.round(average(results.map((result) => result.score))),
      weakRate: toPercent(
        results.filter((result) => result.label === "Weak").length,
        results.length,
      ),
      commonIssue: topIssue(results.flatMap((result) => result.issues)),
      sampleCount: results.length,
    }))
    .sort((left, right) => right.sampleCount - left.sampleCount);
}

function buildActivityFeed(input: {
  scans: ScanSession[];
  diagnostics: QuickDiagnosticResult[];
}): AdminActivityItem[] {
  const scanItems: AdminActivityItem[] = input.scans.slice(0, 6).map((scan) => ({
    id: `scan-${scan.id}`,
    type: "scan",
    title: `${scan.networkName} finished ${scan.mode.toLowerCase()} scan`,
    description: `${scan.roomResults.length} rooms saved with a ${getStatusLabel(scan.homeLabel).toLowerCase()} result.`,
    createdAt: scan.createdAt,
    severity: toneForScan(scan),
  }));

  const diagnosticItems: AdminActivityItem[] = input.diagnostics.slice(0, 6).map((diagnostic) => ({
    id: `diagnostic-${diagnostic.id}`,
    type: "diagnostic",
    title: diagnostic.problem,
    description: diagnostic.fix,
    createdAt: diagnostic.createdAt,
    severity: toneForDiagnostic(diagnostic),
  }));

  const issueItems: AdminActivityItem[] = input.scans
    .filter((scan) => scan.homeScore < 55)
    .slice(0, 4)
    .map((scan) => ({
      id: `issue-${scan.id}`,
      type: "issue",
      title: `Weak home score on ${scan.networkName}`,
      description: scan.summary,
      createdAt: scan.createdAt,
      severity: "danger" as const,
    }));

  return [...scanItems, ...diagnosticItems, ...issueItems]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 10);
}

export function buildAdminDataset(input: {
  source?: "local" | "mock";
  scans: ScanSession[];
  diagnostics: QuickDiagnosticResult[];
  rooms: Room[];
  settings: AppSettings;
  devices: DiscoveredDevice[];
  deviceSupport: DeviceDiscoverySupport | null;
  users?: AdminUserRecord[];
}): AdminDataset {
  const users = buildAdminUsers(input);
  const weakRoomCounts = countBy(
    input.scans.flatMap((scan) => scan.roomResults.filter((room) => room.label === "Weak")),
    (result) => input.rooms.find((room) => room.id === result.roomId)?.name ?? "Unknown room",
  );
  const commonIssueCounts = countBy(
    input.scans.flatMap((scan) => scan.roomResults.flatMap((room) => room.issues)),
    (issue) => issue,
  );
  const roomTypeCounts = countBy(input.rooms, (room) => room.type);
  const floorCounts = countBy(input.rooms, (room) => room.floor);
  const scoreDistribution = [
    {
      label: "Great",
      value: input.scans.filter((scan) => scan.homeScore >= 75).length,
    },
    {
      label: "Fair",
      value: input.scans.filter((scan) => scan.homeScore >= 55 && scan.homeScore < 75).length,
    },
    {
      label: "Weak",
      value: input.scans.filter((scan) => scan.homeScore < 55).length,
    },
  ];
  const recommendationCounts = countBy(
    input.scans.flatMap((scan) => scan.recommendations),
    (recommendation) => recommendation.problem,
  );
  const diagnosticBreakdown = countBy(input.diagnostics, (diagnostic) => diagnostic.problem);
  const diagnosticsByStatus = countBy(input.diagnostics, (diagnostic) => diagnostic.status);
  const deviceTypeDistribution = countBy(input.devices, (device) => getDeviceTypeCopy(device.type));
  const weakDevicePatterns = countBy(
    input.devices.filter((device) => device.signalLabel === "weak"),
    (device) => device.name,
  );
  const highLatencyDevices = countBy(
    input.devices.filter((device) => (device.latencyMs ?? 0) > 80),
    (device) => device.name,
  );
  const roomDropOffs = countBy(
    input.scans.flatMap((scan) => scan.roomResults.filter((result) => result.samples.length === 0)),
    (result) => input.rooms.find((room) => room.id === result.roomId)?.name ?? "Unknown room",
  );
  const completedRoomResults = input.scans.flatMap((scan) => scan.roomResults);
  const scoreTrend = input.scans
    .slice()
    .reverse()
    .map((scan) => ({
      label: format(scan.createdAt, "MMM d"),
      value: scan.homeScore,
      secondaryValue: scan.roomResults.length,
    }));
  const scanVolumeCounts = countBy(
    input.scans.map((scan) => format(scan.createdAt, "MMM d")),
    (label) => label,
  );
  const roomResultsWithContext = input.scans.flatMap((scan) =>
    scan.roomResults.map((result) => ({
      result,
      room: input.rooms.find((entry) => entry.id === result.roomId) ?? null,
    })),
  );
  const avgScoreByRoomType = averageByLabel(
    roomResultsWithContext.filter((entry) => entry.room),
    (entry) => entry.room?.type ?? "Unknown",
    (entry) => entry.result.score,
  ).sort((left, right) => right.value - left.value);
  const avgScoreByFloor = averageByLabel(
    roomResultsWithContext.filter((entry) => entry.room),
    (entry) => entry.room?.floor ?? "Unknown",
    (entry) => entry.result.score,
  ).sort((left, right) => right.value - left.value);
  const activityFeed = buildActivityFeed(input);

  return {
    source: input.source ?? "local",
    users,
    scans: input.scans,
    diagnostics: input.diagnostics,
    rooms: input.rooms,
    settings: input.settings,
    devices: input.devices,
    deviceSupport: input.deviceSupport,
    overview: buildAdminOverview({
      scans: input.scans,
      diagnostics: input.diagnostics,
      deviceSupport: input.deviceSupport,
      users,
    }),
    scoreTrend,
    scanVolumeTrend: topCounts(scanVolumeCounts, 14).reverse(),
    weakRooms: topCounts(weakRoomCounts),
    commonIssues: topCounts(commonIssueCounts),
    roomTypeDistribution: topCounts(roomTypeCounts, 10),
    floorDistribution: topCounts(floorCounts, 10),
    avgScoreByRoomType,
    avgScoreByFloor,
    scoreDistribution,
    recommendationCounts: topCounts(recommendationCounts),
    diagnosticBreakdown: topCounts(diagnosticBreakdown),
    diagnosticsByStatus: topCounts(diagnosticsByStatus),
    deviceTypeDistribution: topCounts(deviceTypeDistribution),
    weakDevicePatterns: topCounts(weakDevicePatterns),
    highLatencyDevices: topCounts(highLatencyDevices),
    scanCompletion: {
      completionRate: toPercent(
        completedRoomResults.filter((result) => result.samples.length > 0).length,
        completedRoomResults.length,
      ),
      skippedRoomRate: toPercent(
        completedRoomResults.filter((result) => result.samples.length === 0).length,
        completedRoomResults.length,
      ),
    },
    roomInsights: buildRoomInsights({ scans: input.scans, rooms: input.rooms }),
    activityFeed,
    recentIssues: activityFeed.filter((item) => item.severity === "danger").slice(0, 4),
    roomDropOffs: topCounts(roomDropOffs),
    recentScans: input.scans.slice(0, 5),
    recentDiagnostics: input.diagnostics.slice(0, 5),
  };
}

export function getScanBand(score: number) {
  if (score >= 75) {
    return "great";
  }
  if (score >= 55) {
    return "fair";
  }
  return "weak";
}

export function getScanStatusText(scan: ScanSession) {
  return getStatusLabel(scan.homeLabel);
}

export function getSeverityFromDiagnostic(diagnostic: QuickDiagnosticResult) {
  if (diagnostic.status === "Weak Signal") {
    return "weak";
  }
  if (diagnostic.status === "Fair Coverage") {
    return "fair";
  }
  return "great";
}

export function withinDateRange(timestamp: number, range: "all" | "7d" | "30d") {
  if (range === "all") {
    return true;
  }
  const days = range === "7d" ? 7 : 30;
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

export function scoreToLabel(score: number): WiFiLabel {
  if (score >= 90) {
    return "Excellent";
  }
  if (score >= 75) {
    return "Good";
  }
  if (score >= 55) {
    return "Fair";
  }
  return "Weak";
}
