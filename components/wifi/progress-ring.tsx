"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getCompactLabel, type WiFiLabel } from "@/lib/types";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: WiFiLabel;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressRing({
  value,
  size = 140,
  strokeWidth = 8,
  label,
  className,
  showLabel = true,
  animated = false,
}: ProgressRingProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayValue / 100) * circumference;

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    let startedAt: number | null = null;
    const durationMs = 1200;

    const tick = (timestamp: number) => {
      if (!startedAt) {
        startedAt = timestamp;
      }

      const progress = Math.min((timestamp - startedAt) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
  }, [animated, value]);

  const colorClass =
    label === "Excellent" || label === "Good"
      ? "text-score-great"
      : label === "Fair"
        ? "text-score-fair"
        : "text-score-weak";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <div
        className="absolute rounded-full bg-white/65 shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
        style={{ width: size + 18, height: size + 18 }}
      />
      <svg width={size} height={size} className="-rotate-90 relative z-10 drop-shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-muted/75"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", colorClass)}
          style={{
            stroke: "currentColor",
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute z-10 flex flex-col items-center">
        <span className={cn("text-4xl font-bold tracking-tight", colorClass)}>
          {displayValue}
          <span className="ml-0.5 text-lg font-medium opacity-70">%</span>
        </span>
        {showLabel && label ? (
          <span className={cn("mt-1 text-sm font-semibold", colorClass)}>
            {getCompactLabel(label)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
