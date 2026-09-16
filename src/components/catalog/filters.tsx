"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { Category, ProductSort, ProductTag } from "@/types";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/input";

interface FiltersProps {
  categories: Category[];
  sizes: string[];
  priceRange: { min: number; max: number };
  resultCount: number;
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "nome", label: "Nome (A–Z)" },
];

const TAG_OPTIONS: { value: ProductTag; label: string; promo?: boolean }[] = [
  { value: "promocao", label: "Promoção", promo: true },
  { value: "mais-vendidos", label: "Mais vendidos" },
  { value: "destaques", label: "Destaques" },
];

const FILTER_KEYS = ["categoria", "tamanho", "precoMin", "precoMax", "tag", "ordenar"] as const;

export function Filters({ categories, sizes, priceRange, resultCount }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const categoria = searchParams.get("categoria") ?? "";
  const tamanho = searchParams.get("tamanho") ?? "";
  const tag = (searchParams.get("tag") ?? "") as ProductTag | "";
  const ordenar = (searchParams.get("ordenar") ?? "recentes") as ProductSort;
  const precoMinParam = searchParams.get("precoMin") ?? "";
  const precoMaxParam = searchParams.get("precoMax") ?? "";

  const [precoMin, setPrecoMin] = useState(precoMinParam);
  const [precoMax, setPrecoMax] = useState(precoMaxParam);
  useEffect(() => setPrecoMin(precoMinParam), [precoMinParam]);
  useEffect(() => setPrecoMax(precoMaxParam), [precoMaxParam]);

  const activeCount = FILTER_KEYS.filter(
    (k) => k !== "ordenar" && searchParams.get(k),
  ).length;

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(changes)) {
        if (v === null || v === "") params.delete(k);
        else params.set(k, v);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_KEYS.forEach((k) => params.delete(k));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const applyPrice = () => update({ precoMin: precoMin || null, precoMax: precoMax || null });

  const chip = (active: boolean, extra?: string) =>
    cn(
      "border px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-colors",
      active
        ? "border-primary bg-primary text-white"
        : "border-border bg-surface text-muted hover:border-foreground/50 hover:text-foreground",
      extra,
    );

  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      {/* Barra mobile */}
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 items-center gap-2 border border-border bg-surface px-3 font-display text-xs font-bold uppercase tracking-wider"
          aria-expanded={open}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center bg-primary px-1 text-[10px] text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>

        <Select
          aria-label="Ordenar"
          value={ordenar}
          onChange={(e) => update({ ordenar: e.target.value === "recentes" ? null : e.target.value })}
          className="h-10 w-auto min-w-40 text-xs"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className={cn("space-y-6", !open && "hidden lg:block")}>
        <div className="hidden items-center justify-between lg:flex">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted">
            {resultCount} {resultCount === 1 ? "produto" : "produtos"}
          </p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
            >
              <X className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>

        {/* Ordenar (desktop) */}
        <FilterGroup title="Ordenar" className="hidden lg:block">
          <Select
            aria-label="Ordenar"
            value={ordenar}
            onChange={(e) => update({ ordenar: e.target.value === "recentes" ? null : e.target.value })}
            className="h-10 text-xs"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </FilterGroup>

        <FilterGroup title="Seleção">
          <div className="flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => update({ tag: tag === t.value ? null : t.value })}
                className={chip(
                  tag === t.value,
                  t.promo && tag !== t.value ? "text-promo hover:text-promo" : undefined,
                )}
                aria-pressed={tag === t.value}
              >
                {t.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Categoria">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => update({ categoria: null })}
              className={chip(!categoria)}
              aria-pressed={!categoria}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => update({ categoria: categoria === c.slug ? null : c.slug })}
                className={chip(categoria === c.slug)}
                aria-pressed={categoria === c.slug}
              >
                {c.nome}
              </button>
            ))}
          </div>
        </FilterGroup>

        {sizes.length > 0 && (
          <FilterGroup title="Tamanho">
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update({ tamanho: tamanho === s ? null : s })}
                  className={chip(tamanho === s, "min-w-10 text-center")}
                  aria-pressed={tamanho === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterGroup>
        )}

        <FilterGroup title="Preço">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              applyPrice();
            }}
          >
            <PriceInput
              value={precoMin}
              onChange={setPrecoMin}
              placeholder={String(priceRange.min)}
              aria-label="Preço mínimo"
            />
            <span className="text-muted">—</span>
            <PriceInput
              value={precoMax}
              onChange={setPrecoMax}
              placeholder={String(priceRange.max)}
              aria-label="Preço máximo"
            />
            <button
              type="submit"
              className="h-10 shrink-0 border border-border bg-surface px-3 font-display text-xs font-bold uppercase tracking-wider hover:bg-surface-2"
            >
              OK
            </button>
          </form>
        </FilterGroup>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="w-full border border-border py-2.5 font-display text-xs font-bold uppercase tracking-wider text-muted hover:text-foreground lg:hidden"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={cn("space-y-2.5", className)}>
      <legend className="mb-2.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function PriceInput({
  value,
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
        R$
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full border border-border bg-surface pl-8 pr-2 text-sm tabular-nums outline-none focus:border-primary"
        {...props}
      />
    </div>
  );
}
