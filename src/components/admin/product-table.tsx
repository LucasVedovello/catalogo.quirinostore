"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { adminDeleteProduct, adminListProducts, adminPatchProduct } from "@/lib/admin";
import { getTotalStock } from "@/lib/products";
import { cn, formatPrice, normalizeText } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { AdminPageHeader, ErrorBanner } from "./admin-shell";

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await adminListProducts());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return products;
    return products.filter((p) =>
      normalizeText(`${p.nome} ${p.marca ?? ""} ${p.categoria?.nome ?? ""} ${p.slug}`).includes(q),
    );
  }, [products, query]);

  const toggle = async (p: Product, field: "ativo" | "eh_destaque" | "eh_mais_vendido" | "eh_promocao") => {
    setBusyId(p.id);
    const next = !p[field];
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, [field]: next } : x)));
    try {
      await adminPatchProduct(p.id, { [field]: next });
    } catch (e) {
      setError((e as Error).message);
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, [field]: !next } : x)));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Excluir "${p.nome}"? As imagens e variantes também serão removidas.`)) return;
    setBusyId(p.id);
    try {
      await adminDeleteProduct(p);
      setProducts((list) => list.filter((x) => x.id !== p.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Produtos"
        description={`${products.length} cadastrados · ${products.filter((p) => p.ativo).length} ativos`}
        actions={
          <Link href="/admin/produtos/novo" className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4" /> Novo produto
          </Link>
        }
      />

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrar por nome, marca, categoria…"
          className="h-10 w-full border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando produtos…
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border px-6 py-16 text-center text-sm text-muted">
          {products.length === 0 ? "Nenhum produto cadastrado ainda." : "Nenhum produto corresponde ao filtro."}
        </div>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-surface text-left font-display text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2.5">Produto</th>
                <th className="px-3 py-2.5">Categoria</th>
                <th className="px-3 py-2.5">Preço</th>
                <th className="px-3 py-2.5 text-center">Estoque</th>
                <th className="px-3 py-2.5">Marcações</th>
                <th className="px-3 py-2.5 text-center">Ativo</th>
                <th className="px-3 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const stock = getTotalStock(p);
                const busy = busyId === p.id;
                return (
                  <tr key={p.id} className={cn("hover:bg-surface/60", !p.ativo && "opacity-60")}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden border border-border bg-surface">
                          {p.imagens[0] ? (
                            <Image src={p.imagens[0].url} alt="" fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center text-muted">
                              <ImageOff className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/produtos/${p.id}`}
                            className="block truncate font-display font-bold uppercase hover:text-primary"
                          >
                            {p.nome}
                          </Link>
                          <p className="truncate text-xs text-muted">
                            {p.marca ? `${p.marca} · ` : ""}/{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted">{p.categoria?.nome ?? "—"}</td>
                    <td className="px-3 py-2">
                      <Price product={p} size="sm" />
                      {p.eh_promocao && !p.preco_promocional && (
                        <p className="text-[10px] text-promo">promoção sem preço</p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={cn("font-display font-bold tabular-nums", stock === 0 && "text-promo")}>
                        {stock}
                      </span>
                      <p className="text-[10px] text-muted">{p.variantes.length} var.</p>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <FlagToggle
                          active={p.eh_promocao}
                          label="Promo"
                          variant="promo"
                          disabled={busy}
                          onClick={() => toggle(p, "eh_promocao")}
                        />
                        <FlagToggle
                          active={p.eh_destaque}
                          label="Destaque"
                          variant="light"
                          disabled={busy}
                          onClick={() => toggle(p, "eh_destaque")}
                        />
                        <FlagToggle
                          active={p.eh_mais_vendido}
                          label="+ Vendido"
                          variant="primary"
                          disabled={busy}
                          onClick={() => toggle(p, "eh_mais_vendido")}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={p.ativo}
                        aria-label={p.ativo ? "Desativar produto" : "Ativar produto"}
                        disabled={busy}
                        onClick={() => toggle(p, "ativo")}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center border transition-colors",
                          p.ativo ? "border-success bg-success/30" : "border-border bg-surface-2",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute h-3.5 w-3.5 transition-all",
                            p.ativo ? "left-[18px] bg-success" : "left-0.5 bg-muted",
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/produtos/${p.id}`}
                          className="grid h-8 w-8 place-items-center text-muted hover:bg-surface-2 hover:text-foreground"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(p)}
                          disabled={busy}
                          className="grid h-8 w-8 place-items-center text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-40"
                          aria-label="Excluir"
                        >
                          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-muted">
        Dica: clique nas marcações para ligar/desligar. Preço total do catálogo:{" "}
        {formatPrice(products.reduce((a, p) => a + p.preco * getTotalStock(p), 0))} em estoque.
      </p>
    </>
  );
}

function FlagToggle({
  active,
  label,
  variant,
  disabled,
  onClick,
}: {
  active: boolean;
  label: string;
  variant: "promo" | "light" | "primary";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={active} className="disabled:opacity-50">
      <Badge variant={active ? variant : "muted"} className={cn(!active && "opacity-60")}>
        {label}
      </Badge>
    </button>
  );
}
