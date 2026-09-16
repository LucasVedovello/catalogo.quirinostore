"use client";

import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
  /** Retorna false quando o tamanho não tem estoque (na cor atual). */
  isAvailable?: (size: string) => boolean;
}

export function SizeSelector({ sizes, value, onChange, isAvailable = () => true }: SizeSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Tamanho" className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const available = isAvailable(size);
        const selected = value === size;
        return (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Tamanho ${size}${available ? "" : " (esgotado)"}`}
            onClick={() => onChange(size)}
            className={cn(
              "relative h-11 min-w-12 border px-3 font-display text-sm font-bold uppercase transition-colors",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface hover:border-foreground/60",
              !available &&
                "text-muted/60 before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-[130%] before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[-25deg] before:bg-muted/50",
              !available && selected && "border-muted bg-surface-2 text-muted",
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
