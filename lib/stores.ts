"use client";

import { create } from "zustand";
import { v4 as uuid } from "uuid";
import { defaultSettings, storage } from "./db";
import { buildRoomResultSummary, buildScanSummary, buildSessionRecommendations, getRoomRecommendations } from "./recommendations";
import { aggregateHomeScore, aggregateRoomScore } from "./scoring";
import type {
  ActiveScanState,
  AppSettings,
  MetricSample,
  QuickDiagnosticResult,
  Room,
  RoomScanResult,
  ScanDraft,
  ScanMode,
  ScanSession,
} from "./types";

const SCAN_DRAFT_KEY = "wc_scan_draft";
const DEMO_MODE_KEY = "wificoach_demo_mode";
const ONBOARDING_KEY = "wificoach_onboarding_complete";

function readDraft(): ScanDraft {
  if (typeof window === "undefined") {
    return {
      networkName: defaultSettings.lastNetworkName,
      mode: "Quick",
      selectedRoomIds: [],
    };
  }

  try {
    const raw = window.localStorage.getItem(SCAN_DRAFT_KEY);
    if (!raw) {
      return {
        networkName: defaultSettings.lastNetworkName,
        mode: "Quick",
        selectedRoomIds: [],
      };
    }

    return JSON.parse(raw) as ScanDraft;
  } catch {
    return {
      networkName: defaultSettings.lastNetworkName,
      mode: "Quick",
      selectedRoomIds: [],
    };
  }
}

function writeDraft(draft: ScanDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SCAN_DRAFT_KEY, JSON.stringify(draft));
}

type RoomDraftInput = Omit<Room, "id" | "createdAt">;

interface RoomsState {
  rooms: Room[];
  loaded: boolean;
  hydrate: () => Promise<void>;
  addRoom: (room: RoomDraftInput) => Promise<Room>;
  updateRoom: (id: string, patch: Partial<RoomDraftInput>) => Promise<Room>;
  deleteRoom: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useRoomsStore = create<RoomsState>((set, get) => ({
  rooms: [],
  loaded: false,

  async hydrate() {
    const rooms = await storage.getRooms();
    set({
      rooms: rooms.sort((left, right) => left.createdAt - right.createdAt),
      loaded: true,
    });
  },

  async addRoom(input) {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Room name is required.");
    }

    const duplicate = get().rooms.some(
      (room) => room.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      throw new Error("That room already exists.");
    }

    const room: Room = {
      id: uuid(),
      name,
      floor: input.floor,
      type: input.type,
      createdAt: Date.now(),
    };
    await storage.putRoom(room);

    set((state) => ({
      rooms: [...state.rooms, room].sort((left, right) => left.createdAt - right.createdAt),
    }));
    return room;
  },

  async updateRoom(id, patch) {
    const existing = get().rooms.find((room) => room.id === id);
    if (!existing) {
      throw new Error("Room not found.");
    }

    const name = patch.name?.trim() ?? existing.name;
    if (!name) {
      throw new Error("Room name is required.");
    }

    const duplicate = get().rooms.some(
      (room) =>
        room.id !== id && room.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      throw new Error("That room already exists.");
    }

    const updated: Room = {
      ...existing,
      ...patch,
      name,
    };
    await storage.putRoom(updated);
    set((state) => ({
      rooms: state.rooms
        .map((room) => (room.id === id ? updated : room))
        .sort((left, right) => left.createdAt - right.createdAt),
    }));
    return updated;
  },

  async deleteRoom(id) {
    await storage.deleteRoom(id);
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== id),
    }));
  },

  async clear() {
    set({ rooms: [] });
  },
}));

interface SettingsState extends AppSettings {
  loaded: boolean;
  hydrate: () => Promise<void>;
  setPingUrl: (url: string) => Promise<void>;
  setDownloadUrl: (url: string) => Promise<void>;
  setUploadUrl: (url: string) => Promise<void>;
  setSimulateWeak: (value: boolean) => Promise<void>;
  setProfileName: (value: string) => Promise<void>;
  setLastNetworkName: (value: string) => Promise<void>;
  reset: () => Promise<void>;
}

async function persistSettings(partial: Partial<AppSettings>) {
  const current = useSettingsStore.getState();
  const next: AppSettings = {
    pingUrl: partial.pingUrl ?? current.pingUrl,
    downloadUrl: partial.downloadUrl ?? current.downloadUrl,
    uploadUrl: partial.uploadUrl ?? current.uploadUrl,
    simulateWeak: partial.simulateWeak ?? current.simulateWeak,
    profileName: partial.profileName ?? current.profileName,
    lastNetworkName: partial.lastNetworkName ?? current.lastNetworkName,
  };
  await storage.putSettings(next);
  return next;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaultSettings,
  loaded: false,

  async hydrate() {
    const settings = await storage.getSettings();
    set({ ...settings, loaded: true });
  },

  async setPingUrl(url) {
    const next = await persistSettings({ pingUrl: url.trim() || defaultSettings.pingUrl });
    set(next);
  },

  async setDownloadUrl(url) {
    const next = await persistSettings({
      downloadUrl: url.trim() || defaultSettings.downloadUrl,
    });
    set(next);
  },

  async setUploadUrl(url) {
    const next = await persistSettings({
      uploadUrl: url.trim() || defaultSettings.uploadUrl,
    });
    set(next);
  },

  async setSimulateWeak(value) {
    const next = await persistSettings({ simulateWeak: value });
    set(next);
  },

  async setProfileName(value) {
    const next = await persistSettings({
      profileName: value.trim() || defaultSettings.profileName,
    });
    set(next);
  },

  async setLastNetworkName(value) {
    const next = await persistSettings({
      lastNetworkName: value.trim() || defaultSettings.lastNetworkName,
    });
    set(next);
  },

  async reset() {
    await storage.putSettings(defaultSettings);
    set({ ...defaultSettings, loaded: true });
  },
}));

interface DiagnosticsState {
  diagnostics: QuickDiagnosticResult[];
  latestDiagnostic: QuickDiagnosticResult | null;
  loaded: boolean;
  hydrate: () => Promise<void>;
  saveDiagnostic: (result: QuickDiagnosticResult) => Promise<void>;
  clear: () => void;
}

export const useDiagnosticsStore = create<DiagnosticsState>((set, get) => ({
  diagnostics: [],
  latestDiagnostic: null,
  loaded: false,

  async hydrate() {
    const diagnostics = await storage.getQuickDiagnostics();
    set({
      diagnostics,
      latestDiagnostic: diagnostics[0] ?? null,
      loaded: true,
    });
  },

  async saveDiagnostic(result) {
    await storage.putQuickDiagnostic(result);
    const diagnostics = [result, ...get().diagnostics.filter((entry) => entry.id !== result.id)];
    set({
      diagnostics,
      latestDiagnostic: diagnostics[0] ?? null,
    });
  },

  clear() {
    set({ diagnostics: [], latestDiagnostic: null });
  },
}));

interface ScanStoreState {
  scans: ScanSession[];
  sessions: ScanSession[];
  loaded: boolean;
  state: ActiveScanState;
  scanId: string;
  mode: ScanMode;
  networkName: string;
  roomIds: string[];
  selectedRoomIds: string[];
  currentRoomIndex: number;
  currentSampleIndex: number;
  roomResults: RoomScanResult[];
  currentSamples: MetricSample[];
  liveSample: Partial<MetricSample> | null;
  hydrate: () => Promise<void>;
  saveScan: (scan: ScanSession) => Promise<void>;
  deleteScan: (id: string) => Promise<void>;
  getScan: (id: string) => ScanSession | undefined;
  setNetworkName: (value: string) => void;
  setMode: (mode: ScanMode) => void;
  setSelectedRoomIds: (roomIds: string[]) => void;
  toggleSelectedRoom: (roomId: string) => void;
  startScan: (roomIds: string[], mode: ScanMode, networkName: string) => void;
  goToRoomArrival: () => void;
  startSampling: () => void;
  addSample: (sample: MetricSample) => void;
  setLiveSample: (sample: Partial<MetricSample> | null) => void;
  finishRoom: () => void;
  skipRoom: () => void;
  nextRoom: () => void;
  completeScan: () => ScanSession;
  reset: () => void;
  clear: () => void;
}

const initialScanState = {
  state: "idle" as ActiveScanState,
  scanId: "",
  mode: "Quick" as ScanMode,
  networkName: defaultSettings.lastNetworkName,
  roomIds: [] as string[],
  selectedRoomIds: [] as string[],
  currentRoomIndex: 0,
  currentSampleIndex: 0,
  roomResults: [] as RoomScanResult[],
  currentSamples: [] as MetricSample[],
  liveSample: null as Partial<MetricSample> | null,
};

function persistScanDraft(partial: Partial<ScanDraft>) {
  const current = useScanStore.getState();
  const next: ScanDraft = {
    networkName: partial.networkName ?? current.networkName,
    mode: partial.mode ?? current.mode,
    selectedRoomIds: partial.selectedRoomIds ?? current.selectedRoomIds,
  };
  writeDraft(next);
}

export const useScanStore = create<ScanStoreState>((set, get) => ({
  scans: [],
  sessions: [],
  loaded: false,
  ...initialScanState,

  async hydrate() {
    const [scans, draft] = await Promise.all([storage.getScans(), Promise.resolve(readDraft())]);
    set({
      scans,
      sessions: scans,
      loaded: true,
      networkName: draft.networkName,
      mode: draft.mode,
      selectedRoomIds: draft.selectedRoomIds,
    });
  },

  async saveScan(scan) {
    await storage.putScan(scan);
    const scans = [scan, ...get().scans.filter((entry) => entry.id !== scan.id)].sort(
      (left, right) => right.createdAt - left.createdAt,
    );
    set({ scans, sessions: scans });
  },

  async deleteScan(id) {
    await storage.deleteScan(id);
    const scans = get().scans.filter((scan) => scan.id !== id);
    set({ scans, sessions: scans });
  },

  getScan(id) {
    return get().scans.find((scan) => scan.id === id);
  },

  setNetworkName(value) {
    const networkName = value || defaultSettings.lastNetworkName;
    persistScanDraft({ networkName });
    set({ networkName });
  },

  setMode(mode) {
    persistScanDraft({ mode });
    set({ mode });
  },

  setSelectedRoomIds(roomIds) {
    persistScanDraft({ selectedRoomIds: roomIds });
    set({ selectedRoomIds: roomIds });
  },

  toggleSelectedRoom(roomId) {
    const selectedRoomIds = get().selectedRoomIds.includes(roomId)
      ? get().selectedRoomIds.filter((id) => id !== roomId)
      : [...get().selectedRoomIds, roomId];
    persistScanDraft({ selectedRoomIds });
    set({ selectedRoomIds });
  },

  startScan(roomIds, mode, networkName) {
    const cleanedNetworkName = networkName.trim() || defaultSettings.lastNetworkName;
    persistScanDraft({
      selectedRoomIds: roomIds,
      mode,
      networkName: cleanedNetworkName,
    });
    void useSettingsStore.getState().setLastNetworkName(cleanedNetworkName);
    set({
      state: "intro",
      scanId: uuid(),
      mode,
      networkName: cleanedNetworkName,
      roomIds,
      selectedRoomIds: roomIds,
      currentRoomIndex: 0,
      currentSampleIndex: 0,
      roomResults: [],
      currentSamples: [],
      liveSample: null,
    });
  },

  goToRoomArrival() {
    set({
      state: "room_arrival",
      currentSamples: [],
      currentSampleIndex: 0,
      liveSample: null,
    });
  },

  startSampling() {
    set({ state: "sampling", liveSample: null });
  },

  addSample(sample) {
    const currentSamples = [...get().currentSamples, sample];
    set({
      currentSamples,
      currentSampleIndex: currentSamples.length,
      liveSample: sample,
    });
  },

  setLiveSample(sample) {
    set({ liveSample: sample });
  },

  finishRoom() {
    const roomId = get().roomIds[get().currentRoomIndex];
    const scored = aggregateRoomScore(get().currentSamples);
    const recommendations = getRoomRecommendations({
      label: scored.label,
      issues: scored.issues,
      samples: get().currentSamples,
    });
    const result: RoomScanResult = {
      roomId,
      samples: get().currentSamples,
      score: scored.score,
      label: scored.label,
      issues: scored.issues,
      recommendations,
      topIssue: scored.issues[0] ?? "Coverage looks good here.",
      recommendationSummary: buildRoomResultSummary({
        roomId,
        samples: get().currentSamples,
        score: scored.score,
        label: scored.label,
        issues: scored.issues,
        recommendations,
        topIssue: scored.issues[0] ?? "Coverage looks good here.",
        recommendationSummary: "",
      }),
    };

    set({
      roomResults: [...get().roomResults, result],
      state: "room_preview",
      liveSample: null,
    });
  },

  skipRoom() {
    const roomId = get().roomIds[get().currentRoomIndex];
    const result: RoomScanResult = {
      roomId,
      samples: [],
      score: 0,
      label: "Weak",
      issues: ["No usable reading captured in this room"],
      recommendations: getRoomRecommendations({
        label: "Weak",
        issues: ["No usable reading captured in this room"],
        samples: [],
      }),
      topIssue: "No usable reading captured in this room",
      recommendationSummary: "This room still needs a proper scan.",
    };

    set({
      roomResults: [...get().roomResults, result],
      state: "room_preview",
      currentSamples: [],
      currentSampleIndex: 0,
      liveSample: null,
    });
  },

  nextRoom() {
    const nextIndex = get().currentRoomIndex + 1;
    if (nextIndex >= get().roomIds.length) {
      set({ state: "complete", currentSamples: [], currentSampleIndex: 0, liveSample: null });
      return;
    }

    set({
      state: "room_arrival",
      currentRoomIndex: nextIndex,
      currentSamples: [],
      currentSampleIndex: 0,
      liveSample: null,
    });
  },

  completeScan() {
    const roomResults = get().roomResults;
    const home = aggregateHomeScore(roomResults);
    const session: ScanSession = {
      id: get().scanId,
      createdAt: Date.now(),
      networkName: get().networkName,
      mode: get().mode,
      roomResults,
      homeScore: home.score,
      homeLabel: home.label,
      summary: buildScanSummary({ homeLabel: home.label, roomResults }),
      recommendations: buildSessionRecommendations(roomResults),
    };

    return session;
  },

  reset() {
    set((state) => ({
      ...state,
      state: "idle",
      scanId: "",
      roomIds: [],
      currentRoomIndex: 0,
      currentSampleIndex: 0,
      roomResults: [],
      currentSamples: [],
      liveSample: null,
    }));
  },

  clear() {
    set({
      scans: [],
      sessions: [],
      loaded: true,
      ...initialScanState,
    });
  },
}));

export const useScansStore = useScanStore;
export const useScanFlowStore = useScanStore;

interface DemoModeState {
  isDemo: boolean;
  hydrate: () => void;
  enableDemo: () => void;
  disableDemo: () => void;
}

export const useDemoModeStore = create<DemoModeState>((set) => ({
  isDemo: false,

  hydrate() {
    if (typeof window === "undefined") {
      return;
    }

    set({ isDemo: window.localStorage.getItem(DEMO_MODE_KEY) === "true" });
  },

  enableDemo() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEMO_MODE_KEY, "true");
    }
    set({ isDemo: true });
  },

  disableDemo() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEMO_MODE_KEY);
    }
    set({ isDemo: false });
  },
}));

interface OnboardingState {
  completed: boolean;
  hydrated: boolean;
  hydrate: () => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  completed: false,
  hydrated: false,

  hydrate() {
    if (typeof window === "undefined") {
      return;
    }

    set({
      completed: window.localStorage.getItem(ONBOARDING_KEY) === "true",
      hydrated: true,
    });
  },

  complete() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_KEY, "true");
    }
    set({ completed: true, hydrated: true });
  },

  reset() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ONBOARDING_KEY);
    }
    set({ completed: false, hydrated: true });
  },
}));
