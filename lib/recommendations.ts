import { aggregateHomeScore } from "./scoring";
import type {
  Recommendation,
  Room,
  RoomScanResult,
  ScanSession,
  WiFiLabel,
} from "./types";

function dedupeRecommendations(recommendations: Recommendation[]) {
  const seen = new Set<string>();
  return recommendations.filter((recommendation) => {
    const key = `${recommendation.problem}-${recommendation.fix}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function getRoomRecommendations(result: {
  label: WiFiLabel;
  issues: string[];
  samples: RoomScanResult["samples"];
}): Recommendation[] {
  const averageSample = {
    latencyMs:
      result.samples.reduce((total, sample) => total + sample.latencyMs, 0) /
      Math.max(result.samples.length, 1),
    downloadMbps:
      result.samples.reduce((total, sample) => total + sample.downloadMbps, 0) /
      Math.max(result.samples.length, 1),
    uploadMbps:
      result.samples.reduce((total, sample) => total + sample.uploadMbps, 0) /
      Math.max(result.samples.length, 1),
    packetLossPct:
      result.samples.reduce((total, sample) => total + sample.packetLossPct, 0) /
      Math.max(result.samples.length, 1),
    jitterMs:
      result.samples.reduce((total, sample) => total + sample.jitterMs, 0) /
      Math.max(result.samples.length, 1),
  };

  const recommendations: Recommendation[] = [];

  if (result.samples.length === 0) {
    recommendations.push({
      problem: "No result was captured in this room",
      cause: "The connection was too weak or the test was skipped.",
      fix: "Retry in this room, then move closer to a hallway or add a mesh node if it still fails.",
      expectedImprovement: "You should get a usable reading and better coverage in the weak area.",
    });
  }

  if (averageSample.downloadMbps < 20 || result.label === "Weak") {
    recommendations.push({
      problem: "Weak WiFi in this room",
      cause: "The router is likely too far away or blocked by walls and furniture.",
      fix: "Move the router to a more central spot or add a mesh node closer to this room.",
      expectedImprovement: "Better coverage and faster speeds in the weaker rooms.",
    });
  }

  if (averageSample.latencyMs > 60) {
    recommendations.push({
      problem: "High latency in this room",
      cause: "Congestion or unstable wireless quality is slowing response times.",
      fix: "Retry closer to the router, reduce heavy traffic on the network, or reboot the router.",
      expectedImprovement: "Smoother video calls and more responsive browsing.",
    });
  }

  if (averageSample.jitterMs > 20 || result.issues.some((issue) => issue.includes("vary"))) {
    recommendations.push({
      problem: "WiFi quality is inconsistent",
      cause: "The signal is likely bouncing through obstructions or interference.",
      fix: "Reduce obstructions around the router, avoid placing it near electronics, or add a mesh point.",
      expectedImprovement: "More stable speed from one test to the next.",
    });
  }

  if (averageSample.packetLossPct > 2) {
    recommendations.push({
      problem: "Some packets are being lost",
      cause: "The connection is unstable, which can cause buffering and dropped calls.",
      fix: "Retry after a router reboot and check if the issue also appears near the router.",
      expectedImprovement: "Fewer interruptions and a steadier connection.",
    });
  }

  if (averageSample.uploadMbps < 8) {
    recommendations.push({
      problem: "Upload speed is low",
      cause: "Weak signal quality is making it harder to send data back reliably.",
      fix: "Move closer to the router for calls and uploads, or improve signal coverage in this room.",
      expectedImprovement: "Better call quality and faster uploads.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      problem: "No major issue detected",
      cause: "The room tested well across speed and stability checks.",
      fix: "Keep the current setup and rescan after any router or room changes.",
      expectedImprovement: "You should maintain strong coverage here.",
    });
  }

  return dedupeRecommendations(recommendations).slice(0, 3);
}

export function buildSessionRecommendations(roomResults: RoomScanResult[]) {
  const home = aggregateHomeScore(roomResults);
  const weakRooms = roomResults.filter((result) => result.label === "Weak");
  const fairRooms = roomResults.filter((result) => result.label === "Fair");
  const recommendations: Recommendation[] = [];

  if (weakRooms.length >= 2) {
    recommendations.push({
      problem: "Several rooms have weak coverage",
      cause: "Your router placement is not reaching enough of the home evenly.",
      fix: "Move the router closer to the centre of the home or add a mesh node for the weak side.",
      expectedImprovement: "Stronger coverage in distant rooms and fewer dead spots.",
    });
  }

  if (
    roomResults.some((result) =>
      result.issues.some((issue) => issue.toLowerCase().includes("latency")),
    )
  ) {
    recommendations.push({
      problem: "Latency is high in parts of the home",
      cause: "Wireless quality or network congestion is affecting response time.",
      fix: "Retry near the router, reduce heavy downloads during calls, and reboot the router if needed.",
      expectedImprovement: "More responsive browsing, gaming, and video calls.",
    });
  }

  if (
    roomResults.some((result) =>
      result.issues.some((issue) => {
        const normalized = issue.toLowerCase();
        return normalized.includes("inconsistent") || normalized.includes("vary");
      }),
    )
  ) {
    recommendations.push({
      problem: "Speed changes from room to room",
      cause: "The signal is being weakened by walls, floors, or interference.",
      fix: "Reduce obstructions near the router or add a mesh node where the signal drops.",
      expectedImprovement: "More even WiFi performance across the home.",
    });
  }

  if (home.label === "Weak" && recommendations.length === 0) {
    recommendations.push({
      problem: "Overall WiFi performance is weak",
      cause: "Signal reach and stability are both limiting coverage.",
      fix: "Start with router placement, then consider a mesh system if the weak rooms stay weak.",
      expectedImprovement: "A clear lift in both coverage and reliability across the home.",
    });
  }

  if (recommendations.length === 0 && fairRooms.length > 0) {
    recommendations.push({
      problem: "Coverage is fair in a few rooms",
      cause: "Your setup is mostly working, but signal strength drops in certain spots.",
      fix: "Fine-tune router placement and rescan the rooms that scored fair.",
      expectedImprovement: "A better chance of moving fair rooms into the great range.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      problem: "No major home-wide issue detected",
      cause: "The tested rooms show strong speed and stable coverage.",
      fix: "Keep this setup and rescan after furniture, router, or ISP changes.",
      expectedImprovement: "You should maintain strong whole-home WiFi.",
    });
  }

  return dedupeRecommendations(recommendations).slice(0, 4);
}

export function buildRoomResultSummary(result: RoomScanResult) {
  if (result.label === "Weak") {
    return "This room needs attention first.";
  }
  if (result.label === "Fair") {
    return "This room is usable, but coverage can be improved.";
  }
  return "This room is in good shape.";
}

export function buildScanSummary(session: Pick<ScanSession, "homeLabel" | "roomResults">) {
  const weakRooms = session.roomResults.filter((room) => room.label === "Weak").length;
  if (session.homeLabel === "Weak") {
    return weakRooms > 1
      ? "Several rooms have weak signal."
      : "Your WiFi needs improvement in at least one room.";
  }
  if (session.homeLabel === "Fair") {
    return "Coverage is fair overall, with some rooms needing a boost.";
  }
  return "Your home WiFi looks strong across the tested rooms.";
}

export function getRoomName(roomId: string, rooms: Room[]) {
  return rooms.find((room) => room.id === roomId)?.name ?? "Unknown room";
}
