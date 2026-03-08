"use client";

import { create } from "zustand";
import {
  discoverDevices,
  getDeviceDiscoverySupport,
  refreshDevices,
} from "./deviceDiscoveryService";
import type {
  DeviceDiscoverySummary,
  DeviceDiscoverySupport,
  DiscoveredDevice,
} from "./types";

const EMPTY_SUMMARY: DeviceDiscoverySummary = {
  totalDevices: 0,
  onlineDevices: 0,
  weakDevices: 0,
  highLatencyDevices: 0,
};

interface DeviceDiscoveryStore {
  support: DeviceDiscoverySupport | null;
  devices: DiscoveredDevice[];
  summary: DeviceDiscoverySummary;
  lastScannedAt: number | null;
  isLoading: boolean;
  error: string | null;
  emptyStateReason: string | null;
  loadSupport: () => Promise<DeviceDiscoverySupport>;
  discoverDevices: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  reset: () => void;
}

export const useDeviceDiscoveryStore = create<DeviceDiscoveryStore>((set, get) => ({
  support: null,
  devices: [],
  summary: EMPTY_SUMMARY,
  lastScannedAt: null,
  isLoading: false,
  error: null,
  emptyStateReason: null,

  async loadSupport() {
    set({ isLoading: true, error: null });
    try {
      const support = await getDeviceDiscoverySupport();
      set({
        support,
        emptyStateReason: support.reason,
        isLoading: false,
      });
      return support;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not check device discovery support.";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  async discoverDevices() {
    set({ isLoading: true, error: null });
    try {
      const result = await discoverDevices();
      set({
        support: result.support,
        devices: result.devices,
        summary: result.summary,
        lastScannedAt: result.scannedAt,
        emptyStateReason: result.devices.length === 0 ? result.support.reason : null,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not discover devices.";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  async refreshDevices() {
    set({ isLoading: true, error: null });
    try {
      const result = await refreshDevices();
      set({
        support: result.support,
        devices: result.devices,
        summary: result.summary,
        lastScannedAt: result.scannedAt,
        emptyStateReason: result.devices.length === 0 ? result.support.reason : null,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not refresh device discovery.";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  reset() {
    set({
      support: null,
      devices: [],
      summary: EMPTY_SUMMARY,
      lastScannedAt: null,
      isLoading: false,
      error: null,
      emptyStateReason: null,
    });
  },
}));
