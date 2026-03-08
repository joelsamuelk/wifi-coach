export type RoomFloor = "Ground" | "Upstairs" | "Other";
export type RoomType =
  | "Living"
  | "Bedroom"
  | "Office"
  | "Kitchen"
  | "Bathroom"
  | "Garden"
  | "Other";
export type ScanMode = "Quick" | "Deep";
export type WiFiLabel = "Excellent" | "Good" | "Fair" | "Weak";
export type WiFiStatus = "Great WiFi" | "Fair Coverage" | "Weak Signal";
export type ActiveScanState =
  | "idle"
  | "intro"
  | "room_arrival"
  | "sampling"
  | "room_preview"
  | "complete";

export interface Room {
  id: string;
  name: string;
  floor: RoomFloor;
  type: RoomType;
  createdAt: number;
}

export interface MetricSample {
  timestamp: number;
  latencyMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
  packetLossPct: number;
}

export interface Recommendation {
  problem: string;
  cause: string;
  fix: string;
  expectedImprovement: string;
}

export interface RoomScanResult {
  roomId: string;
  samples: MetricSample[];
  score: number;
  label: WiFiLabel;
  issues: string[];
  recommendations: Recommendation[];
  topIssue: string;
  recommendationSummary: string;
}

export interface ScanSession {
  id: string;
  createdAt: number;
  networkName: string;
  mode: ScanMode;
  roomResults: RoomScanResult[];
  homeScore: number;
  homeLabel: WiFiLabel;
  summary: string;
  recommendations: Recommendation[];
}

export interface QuickDiagnosticResult {
  id: string;
  createdAt: number;
  latencyMs: number;
  downloadMbps: number;
  uploadMbps: number;
  packetLossPct: number;
  status: WiFiStatus;
  problem: string;
  cause: string;
  fix: string;
  expectedImprovement: string;
}

export interface AppSettings {
  pingUrl: string;
  downloadUrl: string;
  uploadUrl: string;
  simulateWeak: boolean;
  profileName: string;
  lastNetworkName: string;
}

export interface ScanDraft {
  networkName: string;
  mode: ScanMode;
  selectedRoomIds: string[];
}

export interface ActiveScanSnapshot {
  state: ActiveScanState;
  scanId: string;
  mode: ScanMode;
  roomIds: string[];
  currentRoomIndex: number;
  currentSampleIndex: number;
  roomResults: RoomScanResult[];
  currentSamples: MetricSample[];
  liveSample: Partial<MetricSample> | null;
  networkName: string;
}

export const FLOOR_OPTIONS: readonly RoomFloor[] = [
  "Ground",
  "Upstairs",
  "Other",
] as const;

export const ROOM_TYPE_OPTIONS: readonly RoomType[] = [
  "Living",
  "Bedroom",
  "Office",
  "Kitchen",
  "Bathroom",
  "Garden",
  "Other",
] as const;

export const KIND_OPTIONS = ROOM_TYPE_OPTIONS;

export const COMPACT_LABEL: Record<WiFiLabel, "Great" | "Fair" | "Weak"> = {
  Excellent: "Great",
  Good: "Great",
  Fair: "Fair",
  Weak: "Weak",
};

export const STATUS_BY_LABEL: Record<WiFiLabel, WiFiStatus> = {
  Excellent: "Great WiFi",
  Good: "Great WiFi",
  Fair: "Fair Coverage",
  Weak: "Weak Signal",
};

export const LABEL_DESCRIPTION: Record<WiFiLabel, string> = {
  Excellent: "Excellent coverage",
  Good: "Strong coverage",
  Fair: "Fair coverage",
  Weak: "Weak signal",
};

export function getCompactLabel(label: WiFiLabel) {
  return COMPACT_LABEL[label];
}

export function getStatusLabel(label: WiFiLabel) {
  return STATUS_BY_LABEL[label];
}
