import type { Banner } from "@/types";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  banners: Banner[];
  className?: string;
}

/** Faixa animada com avisos (frete grátis, promoções). Conteúdo duplicado para o loop ficar contínuo. */
export function Marquee({ banners, className }: MarqueeProps) {
  const textos = banners.map((b) => b.texto?.trim()).filter((t): t is string => Boolean(t));
  if (textos.length === 0) return null;

  // Garante largura suficiente para telas largas: mínimo de 8 frases por metade.
  const reps = Math.max(2, Math.ceil(8 / textos.length));
  const half = Array.from({ length: reps }, () => textos).flat();
  const items = [...half, ...half];

  return (
    <div
      className={cn("overflow-hidden border-b border-border bg-primary text-white", className)}
      role="marquee"
      aria-label={textos.join(". ")}
    >
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {items.map((texto, i) => (
          <span
            key={i}
            className="flex items-center gap-4 whitespace-nowrap px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.2em]"
            aria-hidden={i >= half.length}
          >
            {texto}
            <span className="text-white/60" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
