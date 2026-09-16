"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Banner } from "@/types";
import { adminDeleteBanner, adminListBanners, adminSaveBanner } from "@/lib/admin";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Marquee } from "@/components/layout/marquee";
import { AdminPageHeader, ErrorBanner } from "./admin-shell";

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setBanners(await adminListBanners());
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setSaving(true);
    try {
      const saved = await adminSaveBanner({
        texto,
        imagem: null,
        ativo: true,
        ordem: (banners.at(-1)?.ordem ?? 0) + 1,
      });
      setBanners((list) => [...list, saved]);
      setTexto("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const patch = async (b: Banner, changes: Partial<Banner>) => {
    setBusyId(b.id);
    const optimistic = { ...b, ...changes };
    setBanners((list) => list.map((x) => (x.id === b.id ? optimistic : x)));
    try {
      const saved = await adminSaveBanner(optimistic);
      setBanners((list) => list.map((x) => (x.id === b.id ? saved : x)).sort((a, z) => a.ordem - z.ordem));
    } catch (err) {
      setError((err as Error).message);
      setBanners((list) => list.map((x) => (x.id === b.id ? b : x)));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (b: Banner) => {
    if (!window.confirm("Excluir este aviso?")) return;
    setBusyId(b.id);
    try {
      await adminDeleteBanner(b.id);
      setBanners((list) => list.filter((x) => x.id !== b.id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Banners"
        description="Frases da faixa animada no topo da loja (frete grátis, promoções, drops)."
      />
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="mb-6 border border-border">
        <p className="border-b border-border bg-surface px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          Prévia
        </p>
        {banners.some((b) => b.ativo && b.texto) ? (
          <Marquee banners={banners.filter((b) => b.ativo)} className="border-b-0" />
        ) : (
          <p className="px-3 py-3 text-xs text-muted">Nenhum aviso ativo — a faixa não aparece na loja.</p>
        )}
      </div>

      <form onSubmit={create} className="mb-6 flex flex-col gap-3 border border-border bg-surface/40 p-4 sm:flex-row sm:items-end">
        <Field label="Novo aviso" htmlFor="banner-texto" className="flex-1">
          <Input
            id="banner-texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex.: Frete grátis acima de R$ 299"
            maxLength={80}
            required
          />
        </Field>
        <Button type="submit" loading={saving}>
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : banners.length === 0 ? (
        <p className="border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
          Nenhum aviso cadastrado.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {banners.map((b) => {
            const busy = busyId === b.id;
            return (
              <li key={b.id} className={cn("flex flex-wrap items-center gap-3 px-4 py-3", !b.ativo && "opacity-60")}>
                <Input
                  type="number"
                  min={0}
                  value={b.ordem}
                  onChange={(e) => patch(b, { ordem: parseInt(e.target.value || "0", 10) || 0 })}
                  className="h-9 w-16 text-center"
                  aria-label="Ordem"
                />
                <Input
                  defaultValue={b.texto ?? ""}
                  onBlur={(e) => e.target.value !== (b.texto ?? "") && patch(b, { texto: e.target.value })}
                  className="h-9 min-w-48 flex-1"
                  aria-label="Texto"
                  maxLength={80}
                />
                <label className="flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={b.ativo}
                    onChange={(e) => patch(b, { ativo: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                    disabled={busy}
                  />
                  Ativo
                </label>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => remove(b)}
                  loading={busy}
                  aria-label="Excluir"
                  className="hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
