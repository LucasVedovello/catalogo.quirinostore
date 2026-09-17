"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BannerImage } from "@/types";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  /** Só as imagens ativas, já ordenadas. */
  images: BannerImage[];
  /** Vai no wrapper externo — é aqui que entram as classes de proporção (aspect-*). */
  className?: string;
  /** Intervalo do avanço automático em ms (0 desliga). */
  interval?: number;
  /** Prioriza o carregamento da primeira imagem (acima da dobra). */
  priority?: boolean;
}

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/**
 * Carrossel do hero da home: fade entre as imagens, avanço automático (pausa no hover), setas, pontos e swipe.
 * Visual: card arredondado com brilho azul difuso atrás, vinheta e gradiente inferior para a foto
 * (normalmente com fundo branco) se fundir ao tema escuro em vez de parecer um print colado.
 */
export function HeroBanner({ images, className, interval = 5000, priority = true }: HeroBannerProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = images.length;

  const goTo = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  // Se a lista mudar (prévia do admin), evita apontar para um índice que não existe mais.
  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [index, total]);

  useEffect(() => {
    if (total < 2 || paused || interval <= 0) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % total), interval);
    return () => window.clearInterval(id);
  }, [total, paused, interval, index]);

  if (total === 0) return null;

  const slide = (img: BannerImage, i: number) => {
    const picture = (
      <Image
        src={img.url}
        alt={img.titulo ?? `Banner ${i + 1}`}
        fill
        priority={priority && i === 0}
        sizes="(max-width: 1024px) 100vw, 50vw"
        // brightness/contrast levemente abaixo de 1 tiram o "estouro" do branco das fotos de produto
        className="object-cover brightness-[0.94] contrast-[0.96] saturate-[1.05] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        draggable={false}
      />
    );
    const cls = cn(
      "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
      i === index ? "opacity-100" : "pointer-events-none opacity-0",
    );
    if (!img.link) {
      return (
        <div key={img.id} className={cls} aria-hidden={i !== index}>
          {picture}
        </div>
      );
    }
    return isExternal(img.link) ? (
      <a
        key={img.id}
        href={img.link}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        aria-hidden={i !== index}
        tabIndex={i === index ? 0 : -1}
        aria-label={img.titulo ?? `Banner ${i + 1}`}
      >
        {picture}
      </a>
    ) : (
      <Link
        key={img.id}
        href={img.link}
        className={cls}
        aria-hidden={i !== index}
        tabIndex={i === index ? 0 : -1}
        aria-label={img.titulo ?? `Banner ${i + 1}`}
      >
        {picture}
      </Link>
    );
  };

  return (
    <div className={cn("relative isolate", className)}>
      {/* Brilho ambiente da marca atrás do card — fica fora do overflow-hidden para poder vazar. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/20 blur-3xl sm:-inset-10"
      />

      <div
        className="group relative h-full w-full select-none overflow-hidden rounded-xl bg-surface shadow-[0_30px_70px_-25px_rgba(0,0,0,0.85)] sm:rounded-2xl"
        role="region"
        aria-roledescription="carrossel"
        aria-label="Destaques"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          const end = e.changedTouches[0]?.clientX;
          if (start === null || end === undefined || total < 2) return;
          const delta = end - start;
          if (Math.abs(delta) < 40) return;
          if (delta < 0) next();
          else prev();
        }}
      >
        {images.map(slide)}

        {/* Vinheta nas bordas + gradiente inferior: suavizam a transição da foto para o fundo escuro. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_40%,transparent_55%,rgba(13,13,13,0.6)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background/85 via-background/30 to-transparent"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/70 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/70 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5"
              role="tablist"
              aria-label="Ir para imagem"
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Imagem ${i + 1} de ${total}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-primary" : "w-3 bg-white/50 hover:bg-white/80",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
