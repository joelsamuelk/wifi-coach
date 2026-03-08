import type {
  AppSettings,
  MetricSample,
  QuickDiagnosticResult,
  Recommendation,
  Room,
  RoomScanResult,
  ScanSession,
} from "@/lib/types";
import type { DeviceDiscoverySupport, DiscoveredDevice } from "@/lib/devices";
import { buildAdminDataset, scoreToLabel } from "./selectors";
import type { AdminDataset, AdminUserRecord } from "./types";

const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;
const minute = 60 * 1000;

function recommendation(
  problem: string,
  cause: string,
  fix: string,
  expectedImprovement: string,
): Recommendation {
  return { problem, cause, fix, expectedImprovement };
}

function sample(
  timestamp: number,
  latencyMs: number,
  jitterMs: number,
  downloadMbps: number,
  uploadMbps: number,
  packetLossPct: number,
): MetricSample {
  return {
    timestamp,
    latencyMs,
    jitterMs,
    downloadMbps,
    uploadMbps,
    packetLossPct,
  };
}

function roomResult(
  roomId: string,
  score: number,
  issues: string[],
  topIssue: string,
  recommendationSummary: string,
  samples: MetricSample[],
  recommendations: Recommendation[],
): RoomScanResult {
  return {
    roomId,
    score,
    label: scoreToLabel(score),
    issues,
    recommendations,
    topIssue,
    recommendationSummary,
    samples,
  };
}

const rooms: Room[] = [
  { id: "room-living", name: "Living Room", floor: "Ground", type: "Living", createdAt: now - 40 * day },
  { id: "room-bedroom", name: "Main Bedroom", floor: "Upstairs", type: "Bedroom", createdAt: now - 40 * day },
  { id: "room-office", name: "Upstairs Office", floor: "Upstairs", type: "Office", createdAt: now - 35 * day },
  { id: "room-kitchen", name: "Kitchen", floor: "Ground", type: "Kitchen", createdAt: now - 33 * day },
  { id: "room-garden", name: "Garden Room", floor: "Other", type: "Garden", createdAt: now - 31 * day },
  { id: "room-bathroom", name: "Guest Bathroom", floor: "Upstairs", type: "Bathroom", createdAt: now - 29 * day },
  { id: "room-nook", name: "Reading Nook", floor: "Ground", type: "Other", createdAt: now - 27 * day },
];

const hallwayMeshRecommendation = recommendation(
  "Weak WiFi in distant rooms",
  "The router is too far from upstairs and garden areas.",
  "Move the router closer to the hallway or add a mesh node near the stairs.",
  "Better coverage in the office, bedroom, and garden room.",
);

const obstructionRecommendation = recommendation(
  "Inconsistent room speeds",
  "Walls and furniture are weakening the signal between rooms.",
  "Reduce obstructions near the router and keep it off the floor.",
  "More stable speeds across the home.",
);

const latencyRecommendation = recommendation(
  "High latency affecting calls",
  "Congestion or poor signal quality is increasing response times.",
  "Retry near the router, restart the router, and check for heavy traffic during calls.",
  "Smoother video calls and gaming sessions.",
);

const scans: ScanSession[] = [
  {
    id: "scan-001",
    createdAt: now - 9 * day,
    networkName: "CoachHome-5G",
    mode: "Deep",
    roomResults: [
      roomResult("room-living", 92, ["Strong coverage"], "Strong coverage", "Keep current router placement.", [
        sample(now - 9 * day + 1 * hour, 18, 4, 162, 32, 0.1),
        sample(now - 9 * day + 1.1 * hour, 21, 5, 154, 31, 0.2),
        sample(now - 9 * day + 1.2 * hour, 19, 4, 158, 33, 0.1),
      ], [obstructionRecommendation]),
      roomResult("room-bedroom", 66, ["Signal drops through upstairs walls"], "Fair coverage upstairs", "A hallway mesh node would help the bedroom.", [
        sample(now - 9 * day + 2 * hour, 42, 10, 36, 12, 0.5),
        sample(now - 9 * day + 2.1 * hour, 47, 12, 32, 11, 0.7),
        sample(now - 9 * day + 2.2 * hour, 45, 11, 34, 12, 0.4),
      ], [hallwayMeshRecommendation]),
      roomResult("room-office", 54, ["High latency for calls"], "Weak signal in the office", "Move the router more centrally or add a mesh node.", [
        sample(now - 9 * day + 3 * hour, 82, 20, 18, 9, 1.6),
        sample(now - 9 * day + 3.1 * hour, 78, 18, 20, 10, 1.4),
        sample(now - 9 * day + 3.2 * hour, 85, 24, 16, 8, 1.8),
      ], [hallwayMeshRecommendation, latencyRecommendation]),
      roomResult("room-garden", 41, ["Weak outdoor coverage"], "Weak signal outside the main home", "Add a mesh node closer to the rear of the house.", [
        sample(now - 9 * day + 4 * hour, 98, 25, 12, 5, 2.6),
        sample(now - 9 * day + 4.1 * hour, 104, 29, 10, 4, 2.9),
        sample(now - 9 * day + 4.2 * hour, 96, 24, 13, 5, 2.4),
      ], [hallwayMeshRecommendation]),
    ],
    homeScore: 63,
    homeLabel: "Fair",
    summary: "Upstairs and outdoor rooms need better coverage.",
    recommendations: [hallwayMeshRecommendation, latencyRecommendation],
  },
  {
    id: "scan-002",
    createdAt: now - 7 * day,
    networkName: "CoachHome-5G",
    mode: "Quick",
    roomResults: [
      roomResult("room-living", 94, ["Strong coverage"], "Great coverage near the router", "No changes needed.", [
        sample(now - 7 * day + 1 * hour, 17, 3, 171, 34, 0.1),
      ], [obstructionRecommendation]),
      roomResult("room-bedroom", 71, ["Fair upstairs signal"], "Bedroom still trails downstairs rooms", "Consider a mesh node near the landing.", [
        sample(now - 7 * day + 2 * hour, 39, 9, 46, 15, 0.3),
      ], [hallwayMeshRecommendation]),
      roomResult("room-office", 61, ["Speeds drop during calls"], "Office still sees variable latency", "Reduce congestion around work hours and move the router higher.", [
        sample(now - 7 * day + 3 * hour, 64, 15, 29, 12, 0.9),
      ], [latencyRecommendation]),
    ],
    homeScore: 75,
    homeLabel: "Good",
    summary: "Coverage improved after moving the router, but the office still needs attention.",
    recommendations: [hallwayMeshRecommendation, latencyRecommendation],
  },
  {
    id: "scan-003",
    createdAt: now - 6 * day,
    networkName: "LoftLine",
    mode: "Deep",
    roomResults: [
      roomResult("room-living", 88, ["Stable coverage"], "Living room performs well", "Maintain current setup.", [
        sample(now - 6 * day + 1 * hour, 22, 6, 112, 21, 0.3),
        sample(now - 6 * day + 1.2 * hour, 24, 7, 105, 19, 0.4),
        sample(now - 6 * day + 1.4 * hour, 21, 5, 118, 22, 0.2),
      ], [obstructionRecommendation]),
      roomResult("room-office", 58, ["Latency spikes at desk"], "Office signal drops behind a thick wall", "Add a mesh node by the hallway and keep the desk clear of obstructions.", [
        sample(now - 6 * day + 2 * hour, 74, 17, 24, 11, 1.1),
        sample(now - 6 * day + 2.2 * hour, 79, 21, 21, 10, 1.5),
        sample(now - 6 * day + 2.4 * hour, 72, 16, 26, 11, 1.0),
      ], [hallwayMeshRecommendation, latencyRecommendation]),
      roomResult("room-bedroom", 63, ["Fair upstairs signal"], "Bedroom has fair but inconsistent coverage", "Elevate the router and reduce interference from neighboring devices.", [
        sample(now - 6 * day + 3 * hour, 49, 10, 32, 13, 0.5),
        sample(now - 6 * day + 3.2 * hour, 52, 12, 29, 12, 0.6),
        sample(now - 6 * day + 3.4 * hour, 47, 9, 35, 14, 0.4),
      ], [obstructionRecommendation]),
    ],
    homeScore: 70,
    homeLabel: "Fair",
    summary: "The office is the main source of weaker WiFi quality.",
    recommendations: [latencyRecommendation, hallwayMeshRecommendation],
  },
  {
    id: "scan-004",
    createdAt: now - 4 * day,
    networkName: "StudioMesh",
    mode: "Quick",
    roomResults: [
      roomResult("room-office", 83, ["Stable workspace connection"], "Office coverage is now strong", "No changes needed.", [
        sample(now - 4 * day + 2 * hour, 28, 8, 68, 18, 0.4),
      ], [hallwayMeshRecommendation]),
      roomResult("room-bedroom", 77, ["Improved upstairs signal"], "Bedroom is now comfortably usable", "Keep the mesh node near the stairs.", [
        sample(now - 4 * day + 2.2 * hour, 31, 9, 57, 16, 0.4),
      ], [hallwayMeshRecommendation]),
      roomResult("room-garden", 59, ["Outdoor signal still weak"], "Garden room remains the weakest zone", "Add a secondary node closer to the back wall.", [
        sample(now - 4 * day + 2.4 * hour, 69, 17, 24, 9, 1.1),
      ], [hallwayMeshRecommendation]),
    ],
    homeScore: 73,
    homeLabel: "Fair",
    summary: "Mesh changes helped upstairs rooms, but the garden room still lags.",
    recommendations: [hallwayMeshRecommendation],
  },
  {
    id: "scan-005",
    createdAt: now - 3 * day,
    networkName: "CoachHome-5G",
    mode: "Deep",
    roomResults: [
      roomResult("room-living", 95, ["Excellent signal"], "Living room remains excellent", "No action needed.", [
        sample(now - 3 * day + 1 * hour, 16, 3, 182, 37, 0.1),
        sample(now - 3 * day + 1.1 * hour, 18, 4, 176, 35, 0.1),
        sample(now - 3 * day + 1.2 * hour, 17, 3, 180, 36, 0.1),
      ], [obstructionRecommendation]),
      roomResult("room-bedroom", 81, ["Good upstairs coverage"], "Bedroom coverage now feels reliable", "Monitor before making further changes.", [
        sample(now - 3 * day + 2 * hour, 29, 8, 62, 18, 0.2),
        sample(now - 3 * day + 2.1 * hour, 32, 9, 58, 17, 0.3),
        sample(now - 3 * day + 2.2 * hour, 28, 7, 64, 18, 0.2),
      ], [hallwayMeshRecommendation]),
      roomResult("room-office", 76, ["Calls are smoother"], "Office latency improved after router restart", "Keep video calls during lower-traffic periods if possible.", [
        sample(now - 3 * day + 3 * hour, 36, 10, 52, 16, 0.4),
        sample(now - 3 * day + 3.1 * hour, 33, 8, 56, 17, 0.3),
        sample(now - 3 * day + 3.2 * hour, 35, 9, 54, 16, 0.4),
      ], [latencyRecommendation]),
      roomResult("room-garden", 63, ["Signal fades at the back wall"], "Garden room is usable but not yet strong", "A second node would make outdoor coverage more consistent.", [
        sample(now - 3 * day + 4 * hour, 56, 14, 31, 12, 0.7),
        sample(now - 3 * day + 4.1 * hour, 61, 15, 29, 11, 0.8),
        sample(now - 3 * day + 4.2 * hour, 58, 13, 30, 12, 0.7),
      ], [hallwayMeshRecommendation]),
    ],
    homeScore: 79,
    homeLabel: "Good",
    summary: "Coverage improved significantly after moving the router and restarting it.",
    recommendations: [hallwayMeshRecommendation, latencyRecommendation],
  },
  {
    id: "scan-006",
    createdAt: now - 2 * day,
    networkName: "GardenFlat",
    mode: "Quick",
    roomResults: [
      roomResult("room-living", 85, ["Stable signal"], "Main room is performing well", "Maintain current setup.", [
        sample(now - 2 * day + 1 * hour, 25, 6, 82, 20, 0.4),
      ], [obstructionRecommendation]),
      roomResult("room-bedroom", 57, ["Latency rises at night"], "Bedroom is sensitive to evening congestion", "Reduce device congestion or use a mesh node upstairs.", [
        sample(now - 2 * day + 2 * hour, 72, 18, 25, 11, 1.4),
      ], [latencyRecommendation]),
      roomResult("room-kitchen", 74, ["Fair kitchen coverage"], "Kitchen is usable with mild variability", "Keep appliances away from the router if possible.", [
        sample(now - 2 * day + 3 * hour, 43, 10, 41, 13, 0.6),
      ], [obstructionRecommendation]),
    ],
    homeScore: 72,
    homeLabel: "Fair",
    summary: "Evening congestion is affecting bedroom performance the most.",
    recommendations: [latencyRecommendation, obstructionRecommendation],
  },
  {
    id: "scan-007",
    createdAt: now - 28 * hour,
    networkName: "CoachHome-5G",
    mode: "Deep",
    roomResults: [
      roomResult("room-living", 96, ["Excellent signal"], "Main living room is excellent", "No action needed.", [
        sample(now - 28 * hour + 1 * hour, 15, 3, 188, 38, 0.1),
        sample(now - 28 * hour + 1.1 * hour, 16, 3, 190, 39, 0.1),
        sample(now - 28 * hour + 1.2 * hour, 15, 2, 186, 38, 0.1),
      ], [obstructionRecommendation]),
      roomResult("room-bedroom", 84, ["Strong upstairs signal"], "Bedroom is now strong", "No changes needed for now.", [
        sample(now - 28 * hour + 2 * hour, 27, 7, 71, 19, 0.2),
        sample(now - 28 * hour + 2.1 * hour, 29, 8, 68, 18, 0.3),
        sample(now - 28 * hour + 2.2 * hour, 26, 7, 72, 19, 0.2),
      ], [hallwayMeshRecommendation]),
      roomResult("room-office", 81, ["Good call quality"], "Office latency is now under control", "Keep the mesh node powered and the router elevated.", [
        sample(now - 28 * hour + 3 * hour, 31, 8, 63, 18, 0.4),
        sample(now - 28 * hour + 3.1 * hour, 34, 9, 59, 17, 0.4),
        sample(now - 28 * hour + 3.2 * hour, 32, 8, 61, 17, 0.4),
      ], [latencyRecommendation]),
      roomResult("room-garden", 68, ["Outdoor signal improved"], "Garden room is better but still below indoor rooms", "Consider a final mesh node if outdoor use is frequent.", [
        sample(now - 28 * hour + 4 * hour, 52, 12, 35, 13, 0.6),
        sample(now - 28 * hour + 4.1 * hour, 55, 13, 33, 12, 0.7),
        sample(now - 28 * hour + 4.2 * hour, 53, 12, 34, 13, 0.7),
      ], [hallwayMeshRecommendation]),
    ],
    homeScore: 82,
    homeLabel: "Good",
    summary: "Recent mesh changes have improved most weak areas.",
    recommendations: [hallwayMeshRecommendation],
  },
  {
    id: "scan-008",
    createdAt: now - 8 * hour,
    networkName: "NestFiber",
    mode: "Quick",
    roomResults: [
      roomResult("room-office", 51, ["Latency still high"], "Office still feels sluggish for video calls", "Restart the router and reduce simultaneous uploads during calls.", [
        sample(now - 8 * hour + 1 * hour, 91, 19, 22, 8, 1.9),
      ], [latencyRecommendation]),
      roomResult("room-bedroom", 64, ["Fair upstairs signal"], "Bedroom is usable but still inconsistent", "Add a hallway mesh node for stronger upstairs coverage.", [
        sample(now - 8 * hour + 2 * hour, 52, 12, 33, 11, 0.8),
      ], [hallwayMeshRecommendation]),
      roomResult("room-garden", 44, ["Weak signal at the edge of the home"], "Outdoor coverage remains too weak for streaming", "Place a mesh node closer to the garden-facing wall.", [
        sample(now - 8 * hour + 3 * hour, 103, 27, 11, 4, 2.7),
      ], [hallwayMeshRecommendation]),
    ],
    homeScore: 56,
    homeLabel: "Fair",
    summary: "The garden room and office are still dragging overall performance down.",
    recommendations: [hallwayMeshRecommendation, latencyRecommendation],
  },
];

const diagnostics: QuickDiagnosticResult[] = [
  {
    id: "diag-001",
    createdAt: now - 10 * day,
    latencyMs: 88,
    downloadMbps: 21,
    uploadMbps: 7,
    packetLossPct: 1.8,
    status: "Weak Signal",
    problem: "Weak WiFi in distant rooms",
    cause: "Router placement is not central to the home.",
    fix: "Move the router toward the hallway or add a mesh node near the stairs.",
    expectedImprovement: "Better coverage in upstairs and garden rooms.",
  },
  {
    id: "diag-002",
    createdAt: now - 7 * day,
    latencyMs: 61,
    downloadMbps: 34,
    uploadMbps: 11,
    packetLossPct: 0.9,
    status: "Fair Coverage",
    problem: "High latency affecting calls",
    cause: "Congestion is increasing response times during busy periods.",
    fix: "Restart the router and reduce heavy uploads during calls.",
    expectedImprovement: "Smoother calls and less lag.",
  },
  {
    id: "diag-003",
    createdAt: now - 5 * day,
    latencyMs: 28,
    downloadMbps: 132,
    uploadMbps: 28,
    packetLossPct: 0.1,
    status: "Great WiFi",
    problem: "WiFi is healthy",
    cause: "Router placement and throughput look strong.",
    fix: "No immediate action needed.",
    expectedImprovement: "Maintain current performance.",
  },
  {
    id: "diag-004",
    createdAt: now - 2 * day,
    latencyMs: 76,
    downloadMbps: 24,
    uploadMbps: 9,
    packetLossPct: 1.4,
    status: "Fair Coverage",
    problem: "Inconsistent connection quality",
    cause: "Obstructions and room distance are causing speed swings.",
    fix: "Reduce obstructions around the router and consider a hallway mesh node.",
    expectedImprovement: "More stable room-to-room performance.",
  },
  {
    id: "diag-005",
    createdAt: now - 12 * hour,
    latencyMs: 99,
    downloadMbps: 14,
    uploadMbps: 5,
    packetLossPct: 2.4,
    status: "Weak Signal",
    problem: "High latency affecting gaming",
    cause: "The current room has weak signal quality and heavy congestion.",
    fix: "Retry nearer the router, restart it, or add a closer mesh node.",
    expectedImprovement: "Lower lag and more reliable gameplay.",
  },
];

const devices: DiscoveredDevice[] = [
  {
    id: "device-mbp",
    name: "MacBook Pro",
    type: "laptop",
    ipAddress: "192.168.1.14",
    macAddress: null,
    vendor: "Apple",
    signalLabel: "excellent",
    latencyMs: 18,
    downloadMbps: 182,
    uploadMbps: 34,
    status: "online",
    isCurrentDevice: true,
    confidence: "high",
    notes: "Primary support session device.",
    discoveredAt: now - 20 * minute,
  },
  {
    id: "device-iphone",
    name: "iPhone 16",
    type: "phone",
    ipAddress: "192.168.1.22",
    macAddress: null,
    vendor: "Apple",
    signalLabel: "good",
    latencyMs: 27,
    downloadMbps: 96,
    uploadMbps: 21,
    status: "online",
    isCurrentDevice: false,
    confidence: "high",
    notes: "Healthy mobile connection.",
    discoveredAt: now - 22 * minute,
  },
  {
    id: "device-tv",
    name: "Samsung Frame TV",
    type: "tv",
    ipAddress: "192.168.1.48",
    macAddress: null,
    vendor: "Samsung",
    signalLabel: "fair",
    latencyMs: 58,
    downloadMbps: 38,
    uploadMbps: 8,
    status: "online",
    isCurrentDevice: false,
    confidence: "medium",
    notes: "Streaming may buffer at peak times.",
    discoveredAt: now - 24 * minute,
  },
  {
    id: "device-ps",
    name: "PlayStation 5",
    type: "console",
    ipAddress: "192.168.1.63",
    macAddress: null,
    vendor: "Sony",
    signalLabel: "weak",
    latencyMs: 91,
    downloadMbps: 22,
    uploadMbps: 7,
    status: "online",
    isCurrentDevice: false,
    confidence: "medium",
    notes: "Gaming may feel laggy in the upstairs office.",
    discoveredAt: now - 15 * minute,
  },
  {
    id: "device-speaker",
    name: "Hallway Speaker",
    type: "smart-home",
    ipAddress: "192.168.1.77",
    macAddress: null,
    vendor: "Google",
    signalLabel: "fair",
    latencyMs: 46,
    downloadMbps: 16,
    uploadMbps: 5,
    status: "online",
    isCurrentDevice: false,
    confidence: "medium",
    notes: "Stable enough for voice commands.",
    discoveredAt: now - 26 * minute,
  },
  {
    id: "device-router",
    name: "Hallway Router",
    type: "router",
    ipAddress: "192.168.1.1",
    macAddress: null,
    vendor: "Eero",
    signalLabel: "excellent",
    latencyMs: 8,
    downloadMbps: 310,
    uploadMbps: 52,
    status: "online",
    isCurrentDevice: false,
    confidence: "high",
    notes: "Main router and gateway.",
    discoveredAt: now - 10 * minute,
  },
];

const settings: AppSettings = {
  pingUrl: "/api/test/ping",
  downloadUrl: "/api/test/download",
  uploadUrl: "/api/test/upload",
  simulateWeak: false,
  profileName: "Ava Support",
  lastNetworkName: "CoachHome-5G",
};

const deviceSupport: DeviceDiscoverySupport = {
  canDiscoverDevices: true,
  discoveryMode: "mock",
  reason: "Internal mock discovery is active for the admin dashboard.",
};

function buildUsers(): AdminUserRecord[] {
  return [
    {
      id: "user-ava",
      name: "Ava Patel",
      email: "ava@wifi-coach.test",
      platform: "Web",
      status: "active",
      latestScanAt: scans[7].createdAt,
      latestWifiScore: scans[7].homeScore,
      totalScans: 3,
      totalDiagnostics: 2,
      rooms: rooms.filter((room) => ["room-office", "room-bedroom", "room-garden"].includes(room.id)),
      scans: [scans[7], scans[6], scans[4]],
      diagnostics: [diagnostics[4], diagnostics[3]],
      devices: devices,
      latestRecommendations: scans[7].recommendations,
    },
    {
      id: "user-liam",
      name: "Liam Chen",
      email: "liam@wifi-coach.test",
      platform: "Desktop Web",
      status: "active",
      latestScanAt: scans[5].createdAt,
      latestWifiScore: scans[5].homeScore,
      totalScans: 2,
      totalDiagnostics: 1,
      rooms: rooms.filter((room) => ["room-living", "room-kitchen", "room-bedroom"].includes(room.id)),
      scans: [scans[5], scans[3]],
      diagnostics: [diagnostics[2]],
      devices: devices.slice(0, 3),
      latestRecommendations: scans[5].recommendations,
    },
    {
      id: "user-maya",
      name: "Maya Thompson",
      email: "maya@wifi-coach.test",
      platform: "Web",
      status: "idle",
      latestScanAt: scans[2].createdAt,
      latestWifiScore: scans[2].homeScore,
      totalScans: 3,
      totalDiagnostics: 2,
      rooms: rooms.filter((room) => ["room-living", "room-office", "room-bedroom", "room-garden"].includes(room.id)),
      scans: [scans[2], scans[1], scans[0]],
      diagnostics: [diagnostics[1], diagnostics[0]],
      devices: [],
      latestRecommendations: scans[2].recommendations,
    },
  ];
}

export function buildMockAdminDataset(): AdminDataset {
  return buildAdminDataset({
    source: "mock",
    scans,
    diagnostics,
    rooms,
    settings,
    devices,
    deviceSupport,
    users: buildUsers(),
  });
}
