"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Expandable({
  title,
  children,
  defaultOpen = false,
  className,
}: ExpandableProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("rounded-lg", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="pb-2 text-sm text-foreground">{children}</div>}
    </div>
  );
}
