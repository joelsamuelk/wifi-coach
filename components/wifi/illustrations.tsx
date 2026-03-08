"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Animated WiFi signal waves
export function WifiSignalIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn("relative w-32 h-32", className)}>
      {/* Central router/device */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-6 bg-primary rounded-lg shadow-lg flex items-center justify-center">
        <div className="w-1.5 h-3 bg-primary-foreground rounded-full" />
      </div>
      
      {/* Signal waves */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 border-2 border-primary/40 rounded-full animate-wifi-pulse"
          style={{
            width: `${40 + i * 28}px`,
            height: `${24 + i * 16}px`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated house with rooms
export function HouseIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn("relative w-40 h-36", className)}>
      {/* House outline */}
      <svg viewBox="0 0 160 140" className="w-full h-full">
        {/* Roof */}
        <path
          d="M80 10 L150 55 L10 55 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-primary animate-draw-path"
          style={{ strokeDasharray: 400, strokeDashoffset: 0 }}
        />
        {/* House body */}
        <rect
          x="25"
          y="55"
          width="110"
          height="75"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-primary/70"
        />
        {/* Door */}
        <rect
          x="65"
          y="90"
          width="30"
          height="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary/50"
        />
        {/* Windows */}
        <rect
          x="35"
          y="70"
          width="20"
          height="20"
          fill="currentColor"
          className="text-primary/20 animate-pulse"
          style={{ animationDelay: "0s" }}
        />
        <rect
          x="105"
          y="70"
          width="20"
          height="20"
          fill="currentColor"
          className="text-primary/20 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </svg>
      
      {/* WiFi signals inside house */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2">
        <div className="relative">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
          <div className="absolute top-0 left-0 w-2 h-2 bg-primary rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Scanning animation
export function ScanningIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn("relative w-32 h-32", className)}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
      
      {/* Scanning sweep */}
      <div 
        className="absolute inset-0 rounded-full animate-spin"
        style={{ animationDuration: "3s" }}
      >
        <div 
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary to-transparent origin-left"
          style={{ transform: "translateY(-50%)" }}
        />
      </div>
      
      {/* Inner circles */}
      <div className="absolute inset-4 rounded-full border-2 border-primary/30" />
      <div className="absolute inset-8 rounded-full border-2 border-primary/40" />
      
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
      </div>
      
      {/* Blip dots */}
      <div className="absolute top-6 right-8 w-2 h-2 bg-score-great rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-10 left-6 w-2 h-2 bg-score-fair rounded-full animate-ping" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-6 right-10 w-2 h-2 bg-score-weak rounded-full animate-ping" style={{ animationDelay: "1.5s" }} />
    </div>
  );
}

// Success checkmark animation
export function SuccessIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn("relative w-28 h-28", className)}>
      {/* Background circle */}
      <div className="absolute inset-0 bg-score-great/10 rounded-full animate-scale-in" />
      
      {/* Main circle */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-score-great animate-draw-circle"
          style={{
            strokeDasharray: 283,
            strokeDashoffset: 0,
          }}
        />
        {/* Checkmark */}
        <path
          d="M30 50 L45 65 L70 35"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-score-great animate-draw-check"
          style={{
            strokeDasharray: 60,
            strokeDashoffset: 0,
          }}
        />
      </svg>
    </div>
  );
}

// Speed meter illustration
export function SpeedMeterIllustration({ className, value = 50 }: IllustrationProps & { value?: number }) {
  const angle = (value / 100) * 180 - 90;
  
  return (
    <div className={cn("relative w-36 h-20", className)}>
      <svg viewBox="0 0 144 80" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 12 70 A 60 60 0 0 1 132 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-muted"
        />
        {/* Colored segments */}
        <path
          d="M 12 70 A 60 60 0 0 1 52 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-score-weak/50"
        />
        <path
          d="M 52 20 A 60 60 0 0 1 92 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-score-fair/50"
        />
        <path
          d="M 92 20 A 60 60 0 0 1 132 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-score-great/50"
        />
        {/* Needle */}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "72px 70px" }}>
          <line
            x1="72"
            y1="70"
            x2="72"
            y2="25"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-primary transition-transform duration-1000"
          />
        </g>
        {/* Center dot */}
        <circle cx="72" cy="70" r="6" fill="currentColor" className="text-primary" />
      </svg>
    </div>
  );
}

// Room placeholder illustration
export function RoomIllustration({ className, variant = "living" }: IllustrationProps & { variant?: "living" | "bedroom" | "office" | "kitchen" }) {
  const icons: Record<string, ReactNode> = {
    living: (
      <path d="M4 18h16M6 18V4h12v14M9 8h6M9 12h6" strokeWidth="1.5" strokeLinecap="round" />
    ),
    bedroom: (
      <path d="M3 18h18M5 18V8a2 2 0 012-2h10a2 2 0 012 2v10M8 10h8v4H8z" strokeWidth="1.5" strokeLinecap="round" />
    ),
    office: (
      <path d="M4 18h16M6 18V4h12v14M8 8h8M8 11h5M15 8v6" strokeWidth="1.5" strokeLinecap="round" />
    ),
    kitchen: (
      <path d="M4 18h16M8 18V6M12 18V6M16 18V6M6 10h12M6 14h12" strokeWidth="1.5" strokeLinecap="round" />
    ),
  };

  return (
    <div className={cn("w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center", className)}>
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="none" stroke="currentColor">
        {icons[variant] || icons.living}
      </svg>
    </div>
  );
}
