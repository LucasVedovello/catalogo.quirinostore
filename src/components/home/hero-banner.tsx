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
  className?: string;
  /** Intervalo do avanço automático em ms (0 desliga). */
  interval?: number;
  /** Prioriza o carregamento da primeira imagem (acima da dobra). */
  priority?: boolean;
}

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** Carrossel do hero da home: fade entre as imagens, avanço automático (pausa no hover), setas, pontos e swipe. */
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
        className="object-cover"
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
    <div
      className={cn("group relative select-none overflow-hidden border border-border bg-surface", className)}
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

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-background/70 text-foreground opacity-0 transition-opacity hover:bg-background focus-visible:opacity-100 group-hover:opacity-100"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-background/70 text-foreground opacity-0 transition-opacity hover:bg-background focus-visible:opacity-100 group-hover:opacity-100"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" role="tablist" aria-label="Ir para imagem">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Imagem ${i + 1} de ${total}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 transition-all",
                  i === index ? "w-6 bg-primary" : "w-3 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
