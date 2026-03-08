export const ADMIN_SCORING_THRESHOLDS = {
  latency: {
    goodUnderMs: 30,
    fairUnderMs: 60,
  },
  download: {
    goodOverMbps: 50,
    fairOverMbps: 20,
  },
  packetLoss: {
    weakOverPct: 2,
  },
  scoreBands: {
    excellentMin: 90,
    goodMin: 75,
    fairMin: 55,
  },
};

export const ADMIN_FEATURE_FLAGS = [
  {
    id: "device_discovery",
    label: "Device discovery",
    description: "Expose device discovery screens and insights where supported.",
  },
  {
    id: "mock_device_provider",
    label: "Mock device provider",
    description: "Enable realistic local mock devices for internal development.",
  },
  {
    id: "weak_wifi_simulation",
    label: "Weak Wi-Fi simulation",
    description: "Allow testing of slow and unstable network states.",
  },
];
