"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Walkthrough step definition
export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector to highlight
  position?: "top" | "bottom" | "left" | "right" | "center";
  route?: string; // Navigate to this route before showing
}

// Predefined app walkthrough steps
export const APP_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: "welcome",
    title: "Welcome to WiFi Coach",
    description: "Let me show you around! This quick tour will help you understand how to optimize your home WiFi.",
    position: "center",
    route: "/",
  },
  {
    id: "home-score",
    title: "Your WiFi Score",
    description: "This card shows your overall home WiFi health. Tap it to see detailed results from your latest scan.",
    targetSelector: "[data-walkthrough='home-score']",
    position: "bottom",
    route: "/",
  },
  {
    id: "fix-wifi",
    title: "Fix My WiFi",
    description: "Having issues? Tap here to run a quick diagnostic and get instant suggestions to improve your connection.",
    targetSelector: "[data-walkthrough='fix-wifi']",
    position: "bottom",
    route: "/",
  },
  {
    id: "weak-rooms",
    title: "Problem Areas",
    description: "Rooms with weak signal are highlighted here. Focus on fixing these first for the biggest improvement.",
    targetSelector: "[data-walkthrough='weak-rooms']",
    position: "top",
    route: "/",
  },
  {
    id: "scan-tab",
    title: "Run a Scan",
    description: "Tap here to scan your rooms. Walk to each room and the app will test your WiFi signal strength.",
    targetSelector: "[data-walkthrough='scan-tab']",
    position: "top",
    route: "/",
  },
  {
    id: "rooms-tab",
    title: "Manage Rooms",
    description: "Add, edit, or remove rooms from your home. The more accurate your room list, the better your recommendations.",
    targetSelector: "[data-walkthrough='rooms-tab']",
    position: "top",
    route: "/",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start by running a scan in each room. WiFi Coach will analyze your network and give you personalized tips.",
    position: "center",
  },
];

// Context for walkthrough state
interface WalkthroughContextType {
  isActive: boolean;
  currentStep: number;
  steps: WalkthroughStep[];
  startWalkthrough: (steps?: WalkthroughStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  endWalkthrough: () => void;
  goToStep: (index: number) => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | null>(null);

// Default noop functions for when context is not available
const defaultContext: WalkthroughContextType = {
  isActive: false,
  currentStep: 0,
  steps: [],
  startWalkthrough: () => {},
  nextStep: () => {},
  prevStep: () => {},
  endWalkthrough: () => {},
  goToStep: () => {},
};

export function useWalkthrough() {
  const context = useContext(WalkthroughContext);
  // Return default context if not within provider (safe fallback)
  return context || defaultContext;
}

// Provider component
export function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<WalkthroughStep[]>(APP_WALKTHROUGH_STEPS);

  const startWalkthrough = useCallback((customSteps?: WalkthroughStep[]) => {
    setSteps(customSteps || APP_WALKTHROUGH_STEPS);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsActive(false);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const endWalkthrough = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index);
    }
  }, [steps.length]);

  return (
    <WalkthroughContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startWalkthrough,
        nextStep,
        prevStep,
        endWalkthrough,
        goToStep,
      }}
    >
      {children}
      {isActive && <WalkthroughOverlay />}
    </WalkthroughContext.Provider>
  );
}

// Overlay component that shows the current step
function WalkthroughOverlay() {
  const { currentStep, steps, nextStep, prevStep, endWalkthrough } = useWalkthrough();
  const step = steps[currentStep];
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Find and highlight target element
  useEffect(() => {
    if (step.targetSelector) {
      const target = document.querySelector(step.targetSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        // Scroll target into view
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [step]);

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const isCentered = step.position === "center" || !targetRect;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (isCentered || !targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    
    switch (step.position) {
      case "bottom":
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case "top":
        return {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case "left":
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          right: `${window.innerWidth - targetRect.left + padding}px`,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: "translateY(-50%)",
        };
      default:
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left}px`,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with cutout for highlighted element */}
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm">
        {targetRect && (
          <div
            className="absolute bg-transparent rounded-2xl ring-4 ring-primary ring-offset-4 ring-offset-background shadow-2xl"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        )}
      </div>

      {/* Spotlight cutout */}
      {targetRect && (
        <div
          className="absolute bg-background rounded-xl"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute w-[320px] max-w-[calc(100vw-32px)] bg-card rounded-2xl p-5 shadow-2xl border border-border animate-fade-in-up",
          isCentered && "text-center"
        )}
        style={getTooltipStyle()}
      >
        {/* Close button */}
        <button
          onClick={endWalkthrough}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close walkthrough"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === currentStep
                  ? "w-6 bg-primary"
                  : idx < currentStep
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-border"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {isCentered && <Sparkles className="h-5 w-5 text-primary" />}
            <h3 className="font-semibold text-foreground text-lg">{step.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          {!isFirst ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          ) : (
            <div />
          )}
          
          <Button
            onClick={nextStep}
            size="sm"
            className="rounded-xl min-w-[100px]"
          >
            {isLast ? "Got it!" : "Next"}
            {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
