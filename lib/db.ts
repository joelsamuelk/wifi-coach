import Dexie, { type Table } from "dexie";
import type {
  AppSettings,
  QuickDiagnosticResult,
  Room,
  ScanSession,
} from "./types";

interface KeyValueRecord<T> {
  id: string;
  value: T;
}

const ROOM_KEY = "wc_rooms";
const SCAN_KEY = "wc_scans";
const SETTINGS_KEY = "wc_settings";
const DIAGNOSTIC_KEY = "wc_diagnostics";

const defaultSettings: AppSettings = {
  pingUrl: "/api/test/ping",
  downloadUrl: "/api/test/download",
  uploadUrl: "/api/test/upload",
  simulateWeak: false,
  profileName: "Home WiFi",
  lastNetworkName: "My Wi-Fi",
};

export interface StorageAdapter {
  getRooms(): Promise<Room[]>;
  putRoom(room: Room): Promise<void>;
  deleteRoom(id: string): Promise<void>;
  getScans(): Promise<ScanSession[]>;
  putScan(scan: ScanSession): Promise<void>;
  deleteScan(id: string): Promise<void>;
  getSettings(): Promise<AppSettings>;
  putSettings(settings: AppSettings): Promise<void>;
  getQuickDiagnostics(): Promise<QuickDiagnosticResult[]>;
  putQuickDiagnostic(result: QuickDiagnosticResult): Promise<void>;
  clearAll(): Promise<void>;
}

class WifiCoachDB extends Dexie {
  rooms!: Table<Room, string>;
  scans!: Table<ScanSession, string>;
  settings!: Table<KeyValueRecord<AppSettings>, string>;
  diagnostics!: Table<QuickDiagnosticResult, string>;

  constructor() {
    super("WifiCoachDB");
    this.version(2).stores({
      rooms: "id, name, floor, type, createdAt",
      scans: "id, createdAt, homeScore",
      settings: "id",
      diagnostics: "id, createdAt",
    });
  }
}

let db: WifiCoachDB | null = null;

function getDB() {
  if (!db) {
    db = new WifiCoachDB();
  }
  return db;
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readLocal<T>(key: string, fallback: T): T {
  if (!canUseLocalStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export const storage: StorageAdapter = {
  async getRooms() {
    try {
      const rooms = await getDB().rooms.orderBy("createdAt").toArray();
      return rooms.sort((a, b) => a.createdAt - b.createdAt);
    } catch {
      return readLocal<Room[]>(ROOM_KEY, []).sort((a, b) => a.createdAt - b.createdAt);
    }
  },

  async putRoom(room) {
    try {
      await getDB().rooms.put(room);
    } catch {
      const rooms = readLocal<Room[]>(ROOM_KEY, []);
      const next = rooms.filter((entry) => entry.id !== room.id).concat(room);
      writeLocal(ROOM_KEY, next);
    }
  },

  async deleteRoom(id) {
    try {
      await getDB().rooms.delete(id);
    } catch {
      writeLocal(
        ROOM_KEY,
        readLocal<Room[]>(ROOM_KEY, []).filter((room) => room.id !== id),
      );
    }
  },

  async getScans() {
    try {
      return await getDB().scans.orderBy("createdAt").reverse().toArray();
    } catch {
      return readLocal<ScanSession[]>(SCAN_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  async putScan(scan) {
    try {
      await getDB().scans.put(scan);
    } catch {
      const scans = readLocal<ScanSession[]>(SCAN_KEY, []);
      const next = scans.filter((entry) => entry.id !== scan.id).concat(scan);
      writeLocal(
        SCAN_KEY,
        next.sort((a, b) => b.createdAt - a.createdAt),
      );
    }
  },

  async deleteScan(id) {
    try {
      await getDB().scans.delete(id);
    } catch {
      writeLocal(
        SCAN_KEY,
        readLocal<ScanSession[]>(SCAN_KEY, []).filter((scan) => scan.id !== id),
      );
    }
  },

  async getSettings() {
    try {
      const settings = await getDB().settings.get("settings");
      return settings?.value ?? defaultSettings;
    } catch {
      return readLocal<AppSettings>(SETTINGS_KEY, defaultSettings);
    }
  },

  async putSettings(settings) {
    try {
      await getDB().settings.put({ id: "settings", value: settings });
    } catch {
      writeLocal(SETTINGS_KEY, settings);
    }
  },

  async getQuickDiagnostics() {
    try {
      return await getDB().diagnostics.orderBy("createdAt").reverse().toArray();
    } catch {
      return readLocal<QuickDiagnosticResult[]>(DIAGNOSTIC_KEY, []).sort(
        (a, b) => b.createdAt - a.createdAt,
      );
    }
  },

  async putQuickDiagnostic(result) {
    try {
      await getDB().diagnostics.put(result);
    } catch {
      const diagnostics = readLocal<QuickDiagnosticResult[]>(DIAGNOSTIC_KEY, []);
      const next = diagnostics.filter((entry) => entry.id !== result.id).concat(result);
      writeLocal(
        DIAGNOSTIC_KEY,
        next.sort((a, b) => b.createdAt - a.createdAt),
      );
    }
  },

  async clearAll() {
    try {
      const database = getDB();
      await database.transaction(
        "rw",
        database.rooms,
        database.scans,
        database.settings,
        database.diagnostics,
        async () => {
          await database.rooms.clear();
          await database.scans.clear();
          await database.settings.clear();
          await database.diagnostics.clear();
        },
      );
    } catch {
      // Ignore Dexie failures and fall through to local cleanup.
    }

    if (canUseLocalStorage()) {
      window.localStorage.removeItem(ROOM_KEY);
      window.localStorage.removeItem(SCAN_KEY);
      window.localStorage.removeItem(SETTINGS_KEY);
      window.localStorage.removeItem(DIAGNOSTIC_KEY);
    }
  },
};

export { defaultSettings };
