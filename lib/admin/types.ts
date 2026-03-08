import type {
  AppSettings,
  QuickDiagnosticResult,
  Recommendation,
  Room,
  ScanSession,
  WiFiLabel,
} from "@/lib/types";
import type {
  DeviceDiscoverySupport,
  DiscoveredDevice,
} from "@/lib/devices";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string | null;
  platform: string;
  status: "active" | "idle";
  latestScanAt: number | null;
  latestWifiScore: number | null;
  totalScans: number;
  totalDiagnostics: number;
  rooms: Room[];
  scans: ScanSession[];
  diagnostics: QuickDiagnosticResult[];
  devices: DiscoveredDevice[];
  latestRecommendations: Recommendation[];
}

export interface AdminOverviewMetrics {
  totalUsers: number;
  totalScans: number;
  averageWifiScore: number;
  totalDiagnostics: number;
  weakRoomRate: number;
  deviceDiscoveryAvailability: string;
  deviceDiscoverySupportRate: number;
}

export interface TrendDatum {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface AdminActivityItem {
  id: string;
  type: "scan" | "diagnostic" | "issue";
  title: string;
  description: string;
  createdAt: number;
  severity: "info" | "warning" | "danger";
}

export interface AdminRoomInsight {
  label: string;
  avgScore: number;
  weakRate: number;
  commonIssue: string;
  sampleCount: number;
}

export interface AdminDataset {
  source: "local" | "mock";
  users: AdminUserRecord[];
  scans: ScanSession[];
  diagnostics: QuickDiagnosticResult[];
  rooms: Room[];
  settings: AppSettings;
  devices: DiscoveredDevice[];
  deviceSupport: DeviceDiscoverySupport | null;
  overview: AdminOverviewMetrics;
  scoreTrend: TrendDatum[];
  scanVolumeTrend: TrendDatum[];
  weakRooms: TrendDatum[];
  commonIssues: TrendDatum[];
  roomTypeDistribution: TrendDatum[];
  floorDistribution: TrendDatum[];
  avgScoreByRoomType: TrendDatum[];
  avgScoreByFloor: TrendDatum[];
  scoreDistribution: TrendDatum[];
  recommendationCounts: TrendDatum[];
  diagnosticBreakdown: TrendDatum[];
  diagnosticsByStatus: TrendDatum[];
  deviceTypeDistribution: TrendDatum[];
  weakDevicePatterns: TrendDatum[];
  highLatencyDevices: TrendDatum[];
  scanCompletion: {
    completionRate: number;
    skippedRoomRate: number;
  };
  roomInsights: AdminRoomInsight[];
  activityFeed: AdminActivityItem[];
  recentIssues: AdminActivityItem[];
  roomDropOffs: TrendDatum[];
  recentScans: ScanSession[];
  recentDiagnostics: QuickDiagnosticResult[];
}

export interface AdminFilters {
  query?: string;
  dateRange?: "all" | "7d" | "30d";
  scanMode?: "all" | "Quick" | "Deep";
  scoreBand?: "all" | "great" | "fair" | "weak";
  severity?: "all" | "great" | "fair" | "weak";
}

export interface ScoreBandOption {
  label: string;
  value: "all" | "great" | "fair" | "weak";
  match: (score: number, label?: WiFiLabel) => boolean;
}
