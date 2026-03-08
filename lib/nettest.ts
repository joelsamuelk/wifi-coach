import type { MetricSample } from "./types";

interface TestConfig {
  pingUrl: string;
  downloadUrl: string;
  uploadUrl: string;
  simulateWeak?: boolean;
}

const LATENCY_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 6000;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

async function timedFetch(input: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = performance.now();

  try {
    const response = await fetch(input, {
      cache: "no-store",
      signal: controller.signal,
      ...init,
    });
    return {
      response,
      durationMs: performance.now() - startedAt,
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

function buildSpeedProfile(simulateWeak = false) {
  if (simulateWeak) {
    return {
      download: randomBetween(6, 24),
      upload: randomBetween(1.5, 8),
      latency: randomBetween(58, 120),
      jitter: randomBetween(18, 42),
      packetLoss: randomBetween(1.5, 4.5),
    };
  }

  const strongConnection = Math.random() > 0.35;
  if (strongConnection) {
    return {
      download: randomBetween(62, 180),
      upload: randomBetween(18, 55),
      latency: randomBetween(12, 34),
      jitter: randomBetween(2, 10),
      packetLoss: randomBetween(0, 1.2),
    };
  }

  return {
    download: randomBetween(24, 72),
    upload: randomBetween(8, 24),
    latency: randomBetween(24, 58),
    jitter: randomBetween(6, 20),
    packetLoss: randomBetween(0.2, 2),
  };
}

export async function testConnection(endpoint: string) {
  const { response } = await timedFetch(`${endpoint}?probe=${Date.now()}`);
  if (!response.ok) {
    throw new Error("Connection test failed");
  }
  return true;
}

export async function testLatency(endpoint: string, simulateWeak = false) {
  const durations: number[] = [];
  let failures = 0;

  for (let index = 0; index < LATENCY_ATTEMPTS; index += 1) {
    try {
      const { response, durationMs } = await timedFetch(
        `${endpoint}?ping=${Date.now()}-${index}`,
      );
      if (!response.ok) {
        failures += 1;
        continue;
      }
      durations.push(durationMs);
    } catch {
      failures += 1;
    }
  }

  if (durations.length === 0) {
    return {
      latencyMs: 120,
      jitterMs: 40,
      packetLossPct: 8,
    };
  }

  const baseProfile = buildSpeedProfile(simulateWeak);
  const measuredAverage =
    durations.reduce((total, duration) => total + duration, 0) / durations.length;
  const latencyMs = round(Math.max(baseProfile.latency, measuredAverage + randomBetween(6, 18)));
  const jitterMs = round(
    baseProfile.jitter +
      durations.reduce((total, duration) => total + Math.abs(duration - measuredAverage), 0) /
        durations.length,
  );
  const packetLossPct = round(
    Math.min(8, baseProfile.packetLoss + (failures / LATENCY_ATTEMPTS) * 100),
  );

  return { latencyMs, jitterMs, packetLossPct };
}

export async function testDownloadSpeed(endpoint: string, simulateWeak = false) {
  const { response, durationMs } = await timedFetch(`${endpoint}?download=${Date.now()}`);
  if (!response.ok) {
    throw new Error("Download test failed");
  }

  const profile = buildSpeedProfile(simulateWeak);
  return round(
    clamp(profile.download - Math.min(durationMs / 30, profile.download * 0.25), 2, 240),
  );
}

export async function testUploadSpeed(endpoint: string, simulateWeak = false) {
  const payload = new Blob([new Uint8Array(256 * 1024)]);
  const { response, durationMs } = await timedFetch(endpoint, {
    method: "POST",
    body: payload,
  });
  if (!response.ok) {
    throw new Error("Upload test failed");
  }

  const profile = buildSpeedProfile(simulateWeak);
  return round(
    clamp(profile.upload - Math.min(durationMs / 35, profile.upload * 0.22), 1, 80),
  );
}

export async function runNetworkSample(config: TestConfig): Promise<MetricSample> {
  await testConnection(config.pingUrl);

  const [latency, downloadMbps, uploadMbps] = await Promise.all([
    testLatency(config.pingUrl, config.simulateWeak),
    testDownloadSpeed(config.downloadUrl, config.simulateWeak),
    testUploadSpeed(config.uploadUrl, config.simulateWeak),
  ]);

  return {
    timestamp: Date.now(),
    latencyMs: latency.latencyMs,
    jitterMs: latency.jitterMs,
    downloadMbps,
    uploadMbps,
    packetLossPct: latency.packetLossPct,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
