"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadProductImage } from "@/lib/admin";
import { cn } from "@/lib/utils";

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

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_MB = 8;

export function ImageUploader({ images, onChange, folder, onError }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    const tooBig = list.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      onError?.(`"${tooBig.name}" passa de ${MAX_MB} MB. Reduza a imagem antes de enviar.`);
      return;
    }

    setUploading((n) => n + list.length);
    const uploaded: UploaderImage[] = [];
    for (const file of list) {
      try {
        const url = await uploadProductImage(file, folder);
        uploaded.push({ url, key: `${Date.now()}-${Math.random().toString(36).slice(2)}` });
      } catch (e) {
        onError?.((e as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (uploaded.length > 0) onChange([...images, ...uploaded]);
  };

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
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center transition-colors",
          dragOver ? "border-primary bg-primary/10" : "border-border bg-surface",
        )}
      >
        <ImagePlus className="h-6 w-6 text-muted" />
        <p className="text-sm">
          Arraste imagens aqui ou{" "}
          <button
            type="button"
            className="font-semibold text-primary underline-offset-2 hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            selecione do computador
          </button>
        </p>
        <p className="text-xs text-muted">JPG, PNG, WEBP ou AVIF · até {MAX_MB} MB cada · envio múltiplo</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {uploading > 0 && (
          <p className="flex items-center gap-2 text-xs text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando {uploading}{" "}
            {uploading === 1 ? "imagem" : "imagens"}…
          </p>
        )}
      </div>

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
