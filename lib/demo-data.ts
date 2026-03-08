"use client";

import { v4 as uuid } from "uuid";
import { buildRoomResultSummary, buildSessionRecommendations } from "./recommendations";
import { aggregateHomeScore } from "./scoring";
import type { MetricSample, Room, RoomScanResult, ScanSession } from "./types";

export const DEMO_ROOMS: Omit<Room, "createdAt">[] = [
  { id: "demo-living-room", name: "Living Room", floor: "Ground", type: "Living" },
  { id: "demo-kitchen", name: "Kitchen", floor: "Ground", type: "Kitchen" },
  { id: "demo-office", name: "Home Office", floor: "Upstairs", type: "Office" },
  { id: "demo-bedroom", name: "Main Bedroom", floor: "Upstairs", type: "Bedroom" },
];

function generateSamples(
  quality: "excellent" | "good" | "fair" | "weak",
  count = 3,
): MetricSample[] {
  const base = {
    excellent: { latency: 14, jitter: 3, download: 160, upload: 42, loss: 0.1 },
    good: { latency: 24, jitter: 6, download: 86, upload: 22, loss: 0.4 },
    fair: { latency: 46, jitter: 12, download: 34, upload: 10, loss: 1.2 },
    weak: { latency: 94, jitter: 28, download: 10, upload: 3, loss: 3.8 },
  }[quality];

  return Array.from({ length: count }, (_, index) => ({
    timestamp: Date.now() - (count - index) * 6000,
    latencyMs: Math.round(base.latency * (0.9 + Math.random() * 0.2)),
    jitterMs: Math.round(base.jitter * (0.9 + Math.random() * 0.2)),
    downloadMbps: Math.round(base.download * (0.85 + Math.random() * 0.3)),
    uploadMbps: Math.round(base.upload * (0.85 + Math.random() * 0.3)),
    packetLossPct: Math.round(base.loss * (0.9 + Math.random() * 0.4) * 10) / 10,
  }));
}

function roomResult(
  roomId: string,
  score: number,
  label: RoomScanResult["label"],
  samples: MetricSample[],
  issue: string,
  fix: string,
): RoomScanResult {
  return {
    roomId,
    samples,
    score,
    label,
    issues: [issue],
    recommendations: [
      {
        problem: issue,
        cause: "This room is further from the router than the stronger rooms.",
        fix,
        expectedImprovement: "More reliable coverage and steadier speeds in this room.",
      },
    ],
    topIssue: issue,
    recommendationSummary: buildRoomResultSummary({
      roomId,
      samples,
      score,
      label,
      issues: [issue],
      recommendations: [],
      topIssue: issue,
      recommendationSummary: "",
    }),
  };
}

function createDemoScan(createdAt: number, offsets = 0): ScanSession {
  const roomResults: RoomScanResult[] = [
    roomResult(
      "demo-living-room",
      93 - offsets,
      "Excellent",
      generateSamples("excellent"),
      "Coverage is performing well in this room.",
      "No changes needed here right now.",
    ),
    roomResult(
      "demo-kitchen",
      80 - offsets,
      "Good",
      generateSamples("good"),
      "Latency is a little high in this room.",
      "Keep the router clear of nearby appliances and rescan.",
    ),
    roomResult(
      "demo-office",
      67 - offsets,
      "Fair",
      generateSamples("fair"),
      "Download speed is only fair in this room.",
      "Move the router closer to the centre of the home or add a mesh node.",
    ),
    roomResult(
      "demo-bedroom",
      42 - offsets,
      "Weak",
      generateSamples("weak"),
      "Weak WiFi in this room",
      "Add a mesh node closer to this room or move the router to a more central spot.",
    ),
  ];

  const home = aggregateHomeScore(roomResults);
  return {
    id: `demo-scan-${uuid().slice(0, 8)}`,
    createdAt,
    networkName: "Home WiFi",
    mode: "Deep",
    roomResults,
    homeScore: home.score,
    homeLabel: home.label,
    summary: home.summary,
    recommendations: buildSessionRecommendations(roomResults),
  };
}

export function generateDemoScan() {
  return createDemoScan(Date.now() - 60 * 60 * 1000, 0);
}

export function generateOlderDemoScan() {
  return createDemoScan(Date.now() - 14 * 24 * 60 * 60 * 1000, 12);
}
