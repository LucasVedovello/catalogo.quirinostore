"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/admin";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  /** Pasta no bucket (slug do produto, "banner"…). */
  folder: string;
  /** Chamado uma vez por lote, com as URLs públicas das imagens que subiram. */
  onUploaded: (urls: string[]) => void;
  onError?: (message: string) => void;
  /** Texto auxiliar abaixo da instrução (formatos/tamanho já são mostrados). */
  hint?: string;
  multiple?: boolean;
  className?: string;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_MB = 8;

/** Área de arrastar/soltar que envia as imagens para o Storage e devolve as URLs. */
export function ImageDropzone({
  folder,
  onUploaded,
  onError,
  hint,
  multiple = true,
  className,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    let list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!multiple) list = list.slice(0, 1);
    if (list.length === 0) return;

    const tooBig = list.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      onError?.(`"${tooBig.name}" passa de ${MAX_MB} MB. Reduza a imagem antes de enviar.`);
      return;
    }

    setUploading((n) => n + list.length);
    const uploaded: string[] = [];
    for (const file of list) {
      try {
        uploaded.push(await uploadImage(file, folder));
      } catch (e) {
        onError?.((e as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (uploaded.length > 0) onUploaded(uploaded);
  };

  return (
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
        className,
      )}
    >
      <ImagePlus className="h-6 w-6 text-muted" />
      <p className="text-sm">
        Arraste {multiple ? "imagens" : "uma imagem"} aqui ou{" "}
        <button
          type="button"
          className="font-semibold text-primary underline-offset-2 hover:underline"
          onClick={() => inputRef.current?.click()}
        >
          selecione do computador
        </button>
      </p>
      <p className="text-xs text-muted">
        JPG, PNG, WEBP ou AVIF · até {MAX_MB} MB cada{multiple && " · envio múltiplo"}
        {hint && ` · ${hint}`}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
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
  );
}
