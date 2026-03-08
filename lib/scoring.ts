import type { MetricSample, RoomScanResult, WiFiLabel } from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;

const deviation = (values: number[]) => {
  if (values.length < 2) {
    return 0;
  }

  const mean = average(values);
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

export interface ScoreBreakdown {
  latency: number;
  jitter: number;
  download: number;
  upload: number;
  packetLoss: number;
}

export interface AggregatedRoomScore {
  score: number;
  label: WiFiLabel;
  issues: string[];
  breakdown: ScoreBreakdown;
}

export interface AggregatedHomeScore {
  score: number;
  label: WiFiLabel;
  summary: string;
}

export function scoreSample(sample: MetricSample) {
  const breakdown = getScoreBreakdown(sample);
  const weightedScore =
    breakdown.download * 0.34 +
    breakdown.upload * 0.16 +
    breakdown.latency * 0.24 +
    breakdown.jitter * 0.16 +
    breakdown.packetLoss * 0.1;

  return Math.round(clamp(weightedScore, 0, 100));
}

export function aggregateRoomScore(samples: MetricSample[]): AggregatedRoomScore {
  if (samples.length === 0) {
    return {
      score: 0,
      label: "Weak",
      issues: ["No usable reading captured in this room"],
      breakdown: {
        latency: 0,
        jitter: 0,
        download: 0,
        upload: 0,
        packetLoss: 0,
      },
    };
  }

  const averageSample = getAverageSample(samples);
  const score = Math.round(average(samples.map(scoreSample)));
  const label = labelFromScore(score);
  const issues = detectIssues(samples, averageSample);

  return {
    score,
    label,
    issues,
    breakdown: getScoreBreakdown(averageSample),
  };
}

export function aggregateHomeScore(roomResults: RoomScanResult[]): AggregatedHomeScore {
  if (roomResults.length === 0) {
    return {
      score: 0,
      label: "Weak",
      summary: "No rooms were tested yet.",
    };
  }

  const score = Math.round(average(roomResults.map((result) => result.score)));
  const label = labelFromScore(score);
  const weakRooms = roomResults.filter((result) => result.label === "Weak").length;
  const fairRooms = roomResults.filter((result) => result.label === "Fair").length;

  let summary = "Your home WiFi looks strong across the tested rooms.";
  if (weakRooms > 0) {
    summary =
      weakRooms === 1
        ? "One room has weak signal and should be improved first."
        : `${weakRooms} rooms have weak signal and need attention.`;
  } else if (fairRooms > 0) {
    summary =
      fairRooms === 1
        ? "Most rooms look good, but one room has only fair coverage."
        : "Coverage is mostly good, with a few rooms that need improvement.";
  }

  return { score, label, summary };
}

export function labelFromScore(score: number): WiFiLabel {
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

export function getAverageSample(samples: MetricSample[]): MetricSample {
  return {
    timestamp: samples[samples.length - 1]?.timestamp ?? Date.now(),
    latencyMs: roundTo(average(samples.map((sample) => sample.latencyMs))),
    jitterMs: roundTo(average(samples.map((sample) => sample.jitterMs))),
    downloadMbps: roundTo(average(samples.map((sample) => sample.downloadMbps))),
    uploadMbps: roundTo(average(samples.map((sample) => sample.uploadMbps))),
    packetLossPct: roundTo(average(samples.map((sample) => sample.packetLossPct))),
  };
}

function getScoreBreakdown(sample: MetricSample): ScoreBreakdown {
  return {
    latency: scoreLatency(sample.latencyMs),
    jitter: scoreJitter(sample.jitterMs),
    download: scoreDownload(sample.downloadMbps),
    upload: scoreUpload(sample.uploadMbps),
    packetLoss: scorePacketLoss(sample.packetLossPct),
  };
}

function scoreLatency(value: number) {
  if (value < 30) {
    return 100;
  }
  if (value <= 60) {
    return Math.round(82 - ((value - 30) / 30) * 22);
  }
  return Math.round(clamp(58 - ((value - 60) / 90) * 58, 0, 58));
}

function scoreJitter(value: number) {
  if (value < 8) {
    return 100;
  }
  if (value <= 20) {
    return Math.round(84 - ((value - 8) / 12) * 24);
  }
  return Math.round(clamp(60 - ((value - 20) / 30) * 60, 0, 60));
}

function scoreDownload(value: number) {
  if (value > 50) {
    return 100;
  }
  if (value >= 20) {
    return Math.round(58 + ((value - 20) / 30) * 42);
  }
  return Math.round(clamp((value / 20) * 54, 0, 54));
}

function scoreUpload(value: number) {
  if (value > 20) {
    return 100;
  }
  if (value >= 8) {
    return Math.round(58 + ((value - 8) / 12) * 42);
  }
  return Math.round(clamp((value / 8) * 54, 0, 54));
}

function scorePacketLoss(value: number) {
  if (value <= 0.5) {
    return 100;
  }
  if (value <= 2) {
    return Math.round(86 - ((value - 0.5) / 1.5) * 26);
  }
  return Math.round(clamp(58 - ((value - 2) / 6) * 58, 0, 58));
}

function detectIssues(samples: MetricSample[], averageSample: MetricSample) {
  const issues: string[] = [];
  const latencySpread = Math.max(...samples.map((sample) => sample.latencyMs)) -
    Math.min(...samples.map((sample) => sample.latencyMs));
  const downloadSpread = deviation(samples.map((sample) => sample.downloadMbps));

  if (averageSample.latencyMs > 60) {
    issues.push("High latency is affecting calls and browsing.");
  } else if (averageSample.latencyMs >= 30) {
    issues.push("Latency is a little high in this room.");
  }

  if (averageSample.downloadMbps < 20) {
    issues.push("Download speed is low here.");
  } else if (averageSample.downloadMbps <= 50) {
    issues.push("Download speed is only fair in this room.");
  }

  if (averageSample.uploadMbps < 8) {
    issues.push("Upload speed may struggle on video calls.");
  }

  if (averageSample.packetLossPct > 2) {
    issues.push("Packet loss suggests an unstable signal.");
  }

  if (averageSample.jitterMs > 20) {
    issues.push("Connection quality is inconsistent.");
  }

  if (
    samples.length > 1 &&
    (latencySpread > 35 ||
      (averageSample.downloadMbps > 0 &&
        downloadSpread / averageSample.downloadMbps > 0.28))
  ) {
    issues.push("Results vary from one sample to the next.");
  }

  if (issues.length === 0) {
    issues.push("Coverage is performing well in this room.");
  }

  return issues;
}

function roundTo(value: number) {
  return Math.round(value * 10) / 10;
}
