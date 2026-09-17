"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { ImageDropzone } from "./image-dropzone";

export interface UploaderImage {
  /** id da linha em product_images (imagens já salvas). */
  id?: string;
  url: string;
  /** chave local estável para o React. */
  key: string;
}

interface ImageUploaderProps {
  images: UploaderImage[];
  onChange: (images: UploaderImage[]) => void;
  /** Pasta no bucket (normalmente o slug do produto). */
  folder: string;
  onError?: (message: string) => void;
}

/** Galeria de fotos do produto: upload + ordenação (a primeira é a capa). Persistida junto com o produto. */
export function ImageUploader({ images, onChange, folder, onError }: ImageUploaderProps) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <ImageDropzone
        folder={folder}
        onError={onError}
        onUploaded={(urls) =>
          onChange([
            ...images,
            ...urls.map((url) => ({ url, key: `${Date.now()}-${Math.random().toString(36).slice(2)}` })),
          ])
        }
      />

      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {images.map((img, i) => (
            <li key={img.key} className="group relative aspect-[4/5] overflow-hidden border border-border bg-surface">
              <Image src={img.url} alt={`Imagem ${i + 1}`} fill sizes="160px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 bg-primary px-1.5 py-0.5 font-display text-[10px] font-black uppercase text-white">
                  Capa
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className="grid h-7 w-7 place-items-center text-white hover:bg-white/20 disabled:opacity-30"
                  aria-label="Mover para a esquerda"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="grid h-7 w-7 place-items-center text-white hover:bg-danger"
                  aria-label="Remover imagem"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === images.length - 1}
                  className="grid h-7 w-7 place-items-center text-white hover:bg-white/20 disabled:opacity-30"
                  aria-label="Mover para a direita"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
