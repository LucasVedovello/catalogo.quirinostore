"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  autoFocus?: boolean;
  className?: string;
  /** Chamado após navegar (ex.: fechar a busca mobile). */
  onNavigate?: () => void;
}

const DEBOUNCE_MS = 350;

/**
 * Busca instantânea: escreve o termo em ?busca= e navega para /produtos.
 * Em /produtos usa replace (mantendo ordenação/tamanho/preço); fora dela, push.
 */
export function SearchBar({ autoFocus, className, onNavigate }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlValue = searchParams.get("busca") ?? "";
  const [value, setValue] = useState(urlValue);
  const lastNavigated = useRef(urlValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincroniza com a URL quando ela muda por fora (ex.: botão "limpar filtros").
  useEffect(() => {
    if (urlValue !== lastNavigated.current) {
      lastNavigated.current = urlValue;
      setValue(urlValue);
    }
  }, [urlValue]);

  const navigate = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (q === lastNavigated.current) return;
      lastNavigated.current = q;

      const params = new URLSearchParams(pathname === "/produtos" ? searchParams.toString() : "");
      // Busca é global: solta categoria/seleção para não "esconder" resultados; mantém ordenação, tamanho e preço.
      params.delete("categoria");
      params.delete("tag");
      if (q) params.set("busca", q);
      else params.delete("busca");

      const url = params.toString() ? `/produtos?${params}` : "/produtos";
      if (pathname === "/produtos") router.replace(url, { scroll: false });
      else router.push(url);
      onNavigate?.();
    },
    [pathname, router, searchParams, onNavigate],
  );

  const schedule = (next: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate(next), DEBOUNCE_MS);
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        navigate(value);
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        enterKeyHint="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          schedule(e.target.value);
        }}
        placeholder="Buscar produto, marca..."
        aria-label="Buscar produtos"
        className="h-10 w-full border border-border bg-surface pl-9 pr-9 text-sm outline-none placeholder:text-muted/70 focus:border-primary [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            if (timer.current) clearTimeout(timer.current);
            navigate("");
          }}
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center text-muted hover:text-foreground"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
