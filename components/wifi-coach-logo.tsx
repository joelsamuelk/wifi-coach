"use client";

import { cn } from "@/lib/utils";

interface WifiCoachLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function WifiCoachLogo({
  className,
  size = "md",
  showText = true,
}: WifiCoachLogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-base", gap: "gap-2" },
    md: { icon: 40, text: "text-lg", gap: "gap-2.5" },
    lg: { icon: 56, text: "text-2xl", gap: "gap-3" },
    xl: { icon: 80, text: "text-4xl", gap: "gap-4" },
  };

  const { icon: iconSize, text: textSize, gap } = sizes[size];

  return (
    <div className={cn("flex items-center", gap, className)}>
      {/* Simple WiFi icon with primary color */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* WiFi signal waves */}
        <g transform="translate(24, 28)">
          {/* Outer wave */}
          <path
            d="M-18 -12 C-18 -22, 18 -22, 18 -12"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            className="text-primary/40"
          />
          {/* Middle wave */}
          <path
            d="M-12 -6 C-12 -14, 12 -14, 12 -6"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            className="text-primary/70"
          />
          {/* Inner wave */}
          <path
            d="M-6 0 C-6 -6, 6 -6, 6 0"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            className="text-primary"
          />
          {/* Center dot */}
          <circle
            cx="0"
            cy="6"
            r="4"
            className="fill-primary"
          />
        </g>
      </svg>

      {/* Text */}
      {showText && (
        <span className={cn("font-bold tracking-tight text-foreground", textSize)}>
          WiFi Coach
        </span>
      )}
    </div>
  );
}

// Animated version for loading states
export function WifiCoachLogoAnimated({
  className,
  size = "lg",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: 48,
    md: 64,
    lg: 80,
    xl: 112,
  };

  const iconSize = sizes[size];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* WiFi signal waves with staggered pulse animation */}
        <g transform="translate(24, 28)">
          {/* Outer wave */}
          <path
            d="M-18 -12 C-18 -22, 18 -22, 18 -12"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            className="text-primary/40 animate-pulse"
            style={{ animationDelay: "0.4s", animationDuration: "1.5s" }}
          />
          {/* Middle wave */}
          <path
            d="M-12 -6 C-12 -14, 12 -14, 12 -6"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            className="text-primary/70 animate-pulse"
            style={{ animationDelay: "0.2s", animationDuration: "1.5s" }}
          />
          {/* Inner wave */}
          <path
            d="M-6 0 C-6 -6, 6 -6, 6 0"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            className="text-primary animate-pulse"
            style={{ animationDuration: "1.5s" }}
          />
          {/* Center dot */}
          <circle
            cx="0"
            cy="6"
            r="4"
            className="fill-primary"
          />
        </g>
      </svg>
      
      <span className="text-lg font-bold tracking-tight text-foreground">
        WiFi Coach
      </span>
    </div>
  );
}
