import { cn } from "@/lib/utils";

interface HeroTitleProps {
  /** Texto vindo de site_settings.hero_titulo. */
  text: string;
  className?: string;
}

/** Quebra o texto em linhas (uma por quebra de linha do admin). */
export function splitHeroTitle(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Quando o admin não quebrou linhas, empilha as palavras em 2–3 linhas de comprimento
 * parecido (só quebra em espaços). "Inspirado pelo medo de ser comum" → INSPIRADO / PELO MEDO / DE SER COMUM.
 */
export function balanceHeroLines(line: string): string[] {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2) return [line];
  const target = words.length >= 4 ? 3 : 2;
  const ideal = words.join(" ").length / target;

  const lines: string[] = [];
  let current: string[] = [];
  for (const w of words) {
    const candidate = [...current, w].join(" ");
    if (current.length > 0 && candidate.length > ideal && lines.length < target - 1) {
      lines.push(current.join(" "));
      current = [w];
    } else {
      current.push(w);
    }
  }
  if (current.length > 0) lines.push(current.join(" "));
  return lines;
}

/** Corpo do título pela linha mais longa, para não estourar a coluna do hero. */
function sizeFor(lines: string[]): string {
  const longest = Math.max(...lines.map((l) => l.length));
  if (longest <= 9) return "text-[2.75rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem]";
  if (longest <= 13) return "text-[2.5rem] sm:text-5xl lg:text-6xl xl:text-7xl";
  return "text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl";
}

/**
 * Título do hero com tratamento editorial:
 * - linhas alternam entre sólida (preta, com sombra deslocada em azul) e contornada (só o traço);
 * - a última palavra ganha o azul da marca;
 * - quebras de linha do admin são respeitadas; sem elas, as palavras são equilibradas em 2–3 linhas.
 */
export function HeroTitle({ text, className }: HeroTitleProps) {
  const explicit = splitHeroTitle(text);
  if (explicit.length === 0) return null;
  const lines = explicit.length === 1 ? balanceHeroLines(explicit[0]) : explicit;

  return (
    <h1
      // leading por último: o tailwind-merge descarta um leading-* que venha ANTES de classes text-<tamanho>
      className={cn("mt-4 break-words font-display uppercase", sizeFor(lines), className, "leading-[0.9]")}
    >
      {lines.map((line, i) => {
        const outline = i % 2 === 1;
        const last = i === lines.length - 1;
        const words = line.split(" ");
        const head = words.slice(0, -1).join(" ");
        const tail = words[words.length - 1];

        // block (não inline-block + <br>): evita o espaço extra de baseline entre as linhas
        return (
          <span
            key={i}
            className={cn(
              "block",
              outline
                ? "font-extrabold tracking-tight text-outline"
                : "font-black tracking-tighter text-foreground",
              // 1ª linha: sombra sólida deslocada em azul, efeito de impressão desregistrada
              i === 0 && "[text-shadow:0.045em_0.045em_0_rgb(36_81_255/0.5)]",
            )}
          >
            {last ? (
              <>
                {head && `${head} `}
                <span className={outline ? "text-outline-primary" : "text-primary"}>{tail}</span>
              </>
            ) : (
              line
            )}
          </span>
        );
      })}
    </h1>
  );
}
