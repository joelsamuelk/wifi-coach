"use client";

import type { Room } from "./types";
import { useRoomsStore } from "./stores";

export const DEFAULT_ROOM_PRESETS: Omit<Room, "id" | "createdAt">[] = [
  { name: "Living Room", floor: "Ground", type: "Living" },
  { name: "Main Bedroom", floor: "Upstairs", type: "Bedroom" },
  { name: "Home Office", floor: "Ground", type: "Office" },
  { name: "Kitchen", floor: "Ground", type: "Kitchen" },
];

export async function seedDefaultRooms(presets = DEFAULT_ROOM_PRESETS) {
  const store = useRoomsStore.getState();
  for (const room of presets) {
    try {
      await store.addRoom(room);
    } catch {
      // Ignore duplicates in manual seed flows.
    }
  }
}
