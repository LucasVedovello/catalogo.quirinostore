"use client";

import { cn } from "@/lib/utils";

interface ColorSelectorProps {
  colors: string[];
  value: string | null;
  onChange: (color: string) => void;
  isAvailable?: (color: string) => boolean;
}

/** Mapa simples de nomes → cor visual da bolinha. Nomes fora do mapa mostram só o texto. */
const SWATCHES: Record<string, string> = {
  preto: "#111111",
  branco: "#f5f5f5",
  "off-white": "#ede8dc",
  cinza: "#8a8a8a",
  "cinza mescla": "#9c9c9c",
  chumbo: "#3a3a3a",
  azul: "#2451ff",
  "azul escuro": "#1b2a5b",
  "azul claro": "#8fb3e8",
  indigo: "#2b3a80",
  índigo: "#2b3a80",
  vermelho: "#d0281b",
  laranja: "#f27a1a",
  amarelo: "#f2c522",
  verde: "#2f8f4e",
  "verde militar": "#4b5a3a",
  rosa: "#f2b8c6",
  rosé: "#d9a08f",
  rose: "#d9a08f",
  roxo: "#6b3fa0",
  bege: "#d9c7a5",
  caramelo: "#b5743a",
  marrom: "#5a3a22",
  creme: "#f1e9d2",
};

function swatchFor(name: string): string | null {
  const key = name.trim().toLowerCase();
  if (SWATCHES[key]) return SWATCHES[key];
  // "Vermelho/Preto" → primeira cor conhecida
  const first = key.split(/[\/,+ ]/).find((p) => SWATCHES[p]);
  return first ? SWATCHES[first] : null;
}

export function ColorSelector({ colors, value, onChange, isAvailable = () => true }: ColorSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Cor" className="flex flex-wrap gap-2">
      {colors.map((color) => {
        const available = isAvailable(color);
        const selected = value === color;
        const swatch = swatchFor(color);
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Cor ${color}${available ? "" : " (esgotada)"}`}
            onClick={() => onChange(color)}
            className={cn(
              "inline-flex h-11 items-center gap-2 border px-3 font-display text-xs font-bold uppercase tracking-wide transition-colors",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface hover:border-foreground/60",
              !available && "text-muted/60 line-through decoration-muted/60",
            )}
          >
            {swatch && (
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/30 ring-1 ring-white/20"
                style={{ backgroundColor: swatch }}
                aria-hidden
              />
            )}
            {color}
          </button>
        );
      })}
    </div>
  );
}
