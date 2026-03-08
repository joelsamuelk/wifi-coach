"use client";

import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";
import { getCompactLabel, type WiFiLabel } from "@/lib/types";

interface RoomScoreTileProps {
  name: string;
  score: number;
  label: WiFiLabel;
  onClick?: () => void;
  className?: string;
}

export function RoomScoreTile({
  name,
  score,
  label,
  onClick,
  className,
}: RoomScoreTileProps) {
  const colorClass =
    label === "Excellent" || label === "Good"
      ? "text-score-great"
      : label === "Fair"
        ? "text-score-fair"
        : "text-score-weak";

  const bgClass =
    label === "Excellent" || label === "Good"
      ? "bg-score-great/8"
      : label === "Fair"
        ? "bg-score-fair/8"
        : "bg-score-weak/8";
  const displayLabel = getCompactLabel(label);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex min-h-[100px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-card p-4 transition-all card-shadow hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]",
        className
      )}
      aria-label={`${name}: ${displayLabel}, score ${score}`}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110", bgClass)}>
        {score > 0 ? (
          <Wifi className={cn("h-5 w-5 transition-all", colorClass)} />
        ) : (
          <WifiOff className={cn("h-5 w-5 transition-all", colorClass)} />
        )}
      </div>
      <span className={cn("text-2xl font-bold tracking-tight", colorClass)}>{score}</span>
      <span className="text-[11px] font-medium text-muted-foreground truncate max-w-full">
        {name}
      </span>
    </button>
  );
}
