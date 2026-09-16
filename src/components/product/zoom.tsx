"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoomProps {
  src: string;
  alt: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  counter?: string;
}

const ZOOM_SCALE = 2.5;

/** Visualização em tela cheia. Clique alterna zoom; com zoom, o ponteiro/toque move a área ampliada. */
export function Zoom({ src, alt, onClose, onPrev, onNext, counter }: ZoomProps) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onPrev, onNext]);

  // Reseta o zoom ao trocar de imagem
  useEffect(() => {
    setZoomed(false);
    setOrigin("50% 50%");
  }, [src]);

  const track = (clientX: number, clientY: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - r.top) / r.height) * 100));
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`Zoom: ${alt}`}
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-4 text-white">
        <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          {counter}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className="grid h-10 w-10 place-items-center hover:bg-white/10"
            aria-label={zoomed ? "Reduzir" : "Ampliar"}
          >
            {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative flex-1 touch-none overflow-hidden",
          zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
        )}
        onClick={(e) => {
          track(e.clientX, e.clientY, e.currentTarget);
          setZoomed((z) => !z);
        }}
        onMouseMove={(e) => zoomed && track(e.clientX, e.clientY, e.currentTarget)}
        onTouchMove={(e) => {
          if (!zoomed) return;
          const t = e.touches[0];
          if (t) track(t.clientX, t.clientY, e.currentTarget);
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority
          className="object-contain transition-transform duration-200 ease-out will-change-transform"
          style={{ transform: zoomed ? `scale(${ZOOM_SCALE})` : "scale(1)", transformOrigin: origin }}
          draggable={false}
        />
      </div>

      {(onPrev || onNext) && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev?.();
            }}
            className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-black/40 text-white hover:bg-black/70"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-black/40 text-white hover:bg-black/70"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
}
