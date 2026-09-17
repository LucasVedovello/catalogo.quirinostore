"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import type { BannerImage } from "@/types";
import {
  adminCreateBannerImage,
  adminDeleteBannerImage,
  adminListBannerImages,
  adminPatchBannerImage,
  adminReorderBannerImages,
  BANNER_FOLDER,
} from "@/lib/admin";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroBanner } from "@/components/home/hero-banner";
import { AdminPageHeader, ErrorBanner } from "./admin-shell";
import { ImageDropzone } from "./image-dropzone";

/** Imagens do carrossel do hero da home: upload, ordem, ativar/desativar e remoção. */
export function HeroBannerManager() {
  const [images, setImages] = useState<BannerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setImages(await adminListBannerImages());
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cada upload vira uma linha na hora (diferente das fotos de produto, salvas junto com o produto).
  const add = async (urls: string[]) => {
    let next = [...images];
    for (const url of urls) {
      try {
        const saved = await adminCreateBannerImage(url, next.length);
        next = [...next, saved];
        setImages(next);
      } catch (e) {
        setError((e as Error).message);
      }
    }
  };

  const patch = async (img: BannerImage, changes: Partial<Pick<BannerImage, "ativo" | "titulo" | "link">>) => {
    setBusyId(img.id);
    setImages((list) => list.map((x) => (x.id === img.id ? { ...x, ...changes } : x)));
    try {
      const saved = await adminPatchBannerImage(img.id, changes);
      setImages((list) => list.map((x) => (x.id === img.id ? saved : x)));
    } catch (e) {
      setError((e as Error).message);
      setImages((list) => list.map((x) => (x.id === img.id ? img : x)));
    } finally {
      setBusyId(null);
    }
  };

  const move = async (from: number, to: number) => {
    if (to < 0 || to >= images.length || reordering) return;
    const previous = images;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    const renumbered = next.map((x, i) => ({ ...x, ordem: i }));
    setReordering(true);
    setImages(renumbered);
    try {
      await adminReorderBannerImages(next);
    } catch (e) {
      setError((e as Error).message);
      setImages(previous);
    } finally {
      setReordering(false);
    }
  };

  const remove = async (img: BannerImage) => {
    if (!window.confirm("Remover esta imagem do banner? O arquivo também será apagado.")) return;
    setBusyId(img.id);
    try {
      await adminDeleteBannerImage(img);
      setImages((list) => list.filter((x) => x.id !== img.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const ativas = images.filter((i) => i.ativo);

  return (
    <>
      <AdminPageHeader
        title="Banner"
        description="Imagens do carrossel no topo da home. Sem imagem ativa, a home mostra uma colagem dos produtos em destaque."
      />
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="mb-6 border border-border">
        <p className="border-b border-border bg-surface px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          Prévia
        </p>
        {ativas.length > 0 ? (
          <div className="mx-auto max-w-md p-3">
            <HeroBanner images={ativas} className="aspect-[4/5] sm:aspect-[16/10]" />
          </div>
        ) : (
          <p className="px-3 py-3 text-xs text-muted">Nenhuma imagem ativa — a home usa a colagem de produtos.</p>
        )}
      </div>

      <ImageDropzone
        folder={BANNER_FOLDER}
        onUploaded={add}
        onError={setError}
        hint="a imagem é cortada para preencher o espaço (use fotos de boa resolução)"
        className="mb-6"
      />

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : images.length === 0 ? (
        <p className="border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
          Nenhuma imagem no banner. Envie a primeira acima.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {images.map((img, i) => {
            const busy = busyId === img.id;
            return (
              <li
                key={img.id}
                className={cn(
                  "grid gap-3 px-4 py-3 sm:grid-cols-[auto_128px_1fr_auto] sm:items-center",
                  !img.ativo && "opacity-60",
                )}
              >
                <div className="flex items-center gap-1 sm:flex-col">
                  <span className="mr-2 font-display text-sm font-black text-muted sm:mr-0">#{i + 1}</span>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0 || reordering}
                    aria-label="Mover para cima"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => move(i, i + 1)}
                    disabled={i === images.length - 1 || reordering}
                    aria-label="Mover para baixo"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="relative aspect-[16/10] w-full overflow-hidden border border-border bg-surface sm:w-32">
                  <Image src={img.url} alt={img.titulo ?? `Banner ${i + 1}`} fill sizes="128px" className="object-cover" />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    defaultValue={img.titulo ?? ""}
                    onBlur={(e) => e.target.value !== (img.titulo ?? "") && patch(img, { titulo: e.target.value })}
                    className="h-9"
                    placeholder="Título / texto alternativo (opcional)"
                    aria-label="Título"
                    maxLength={80}
                  />
                  <Input
                    defaultValue={img.link ?? ""}
                    onBlur={(e) => e.target.value !== (img.link ?? "") && patch(img, { link: e.target.value })}
                    className="h-9"
                    placeholder="Link ao clicar, ex.: /produtos?tag=promocao (opcional)"
                    aria-label="Link"
                    maxLength={300}
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={img.ativo}
                      onChange={(e) => patch(img, { ativo: e.target.checked })}
                      className="h-4 w-4 accent-primary"
                      disabled={busy}
                    />
                    Ativa
                  </label>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => remove(img)}
                    loading={busy}
                    aria-label="Remover"
                    className="hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
