"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = "md",
  className,
}: QuantityStepperProps) {
  const h = size === "sm" ? "h-8" : "h-11";
  const w = size === "sm" ? "w-8" : "w-11";
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className={cn("inline-flex items-stretch border border-border bg-surface", h, className)}>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        className={cn(w, "grid place-items-center text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-40")}
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Quantidade"
        className={cn(
          "w-10 bg-transparent text-center font-display text-sm font-bold tabular-nums outline-none",
        )}
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
      />
      <button
        type="button"
        aria-label="Aumentar quantidade"
        className={cn(w, "grid place-items-center text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-40")}
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
