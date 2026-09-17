import { Fragment } from "react";
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
 * Título do hero. Cada quebra de linha vira uma linha; com duas ou mais linhas, a última
 * aparece só com contorno (mesmo efeito do "sem enrolação." original).
 * Títulos longos usam um corpo menor para não estourar a coluna.
 */
export function HeroTitle({ text, className }: HeroTitleProps) {
  const lines = splitHeroTitle(text);
  if (lines.length === 0) return null;

  const longest = Math.max(...lines.map((l) => l.length));
  const size =
    longest > 14
      ? "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl"
      : "text-[2.75rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem]";

  return (
    <h1
      className={cn(
        "mt-4 break-words font-display font-black uppercase leading-[0.88] tracking-tighter",
        size,
        className,
      )}
    >
      {lines.map((line, i) => {
        const last = i === lines.length - 1;
        return (
          <Fragment key={i}>
            {i > 0 && <br />}
            {last && lines.length > 1 ? <span className="text-outline">{line}</span> : line}
          </Fragment>
        );
      })}
    </h1>
  );
}
