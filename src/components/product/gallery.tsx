"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, ImageOff } from "lucide-react";
import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";
import { Zoom } from "./zoom";

interface GalleryProps {
  images: ProductImage[];
  alt: string;
  badge?: React.ReactNode;
}

export function Gallery({ images, alt, badge }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [hovering, setHovering] = useState(false);

  const total = images.length;
  const current = images[index] ?? images[0];

  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  if (total === 0 || !current) {
    return (
      <div className="grid aspect-[4/5] w-full place-items-center border border-border bg-surface text-muted">
        <div className="flex flex-col items-center gap-2 text-sm">
          <ImageOff className="h-8 w-8" />
          Sem imagem
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row-reverse md:gap-3">
      {/* Imagem principal */}
      <div
        className="group relative aspect-[4/5] w-full flex-1 cursor-zoom-in select-none overflow-hidden border border-border bg-surface"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
        onClick={() => setZoomOpen(true)}
      >
        <Image
          key={current.id}
          src={current.url}
          alt={`${alt} — imagem ${index + 1} de ${total}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 ease-out"
          style={{ transform: hovering ? "scale(1.75)" : "scale(1)", transformOrigin: origin }}
          draggable={false}
        />

        {badge && <div className="absolute left-3 top-3 flex flex-col items-start gap-1">{badge}</div>}

        <button
          type="button"
          className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-primary hover:text-white"
          aria-label="Ampliar imagem"
          onClick={(e) => {
            e.stopPropagation();
            setZoomOpen(true);
          }}
        >
          <Expand className="h-4 w-4" />
        </button>

        {total > 1 && (
          <>
            <span className="absolute bottom-3 left-3 bg-background/80 px-2 py-1 font-display text-[11px] font-bold tabular-nums backdrop-blur">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-background/70 opacity-0 transition-opacity hover:bg-background group-hover:opacity-100 focus-visible:opacity-100 md:flex"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-background/70 opacity-0 transition-opacity hover:bg-background group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide md:w-20 md:flex-col md:overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative aspect-[4/5] w-16 shrink-0 overflow-hidden border bg-surface transition-colors md:w-full",
                i === index ? "border-primary" : "border-border opacity-70 hover:opacity-100",
              )}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={i === index}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoomOpen && (
        <Zoom
          src={current.url}
          alt={alt}
          counter={total > 1 ? `${index + 1} / ${total}` : undefined}
          onClose={() => setZoomOpen(false)}
          onPrev={total > 1 ? prev : undefined}
          onNext={total > 1 ? next : undefined}
        />
      )}
    </div>
  );
}
