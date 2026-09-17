"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import type { SiteSettings } from "@/types";
import { adminGetSiteSettings, adminSaveSiteSettings } from "@/lib/admin";
import { defaultSiteSettings } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { HeroTitle } from "@/components/home/hero-title";
import { AdminPageHeader, ErrorBanner } from "./admin-shell";

/** Configurações gerais do site (tabela site_settings, linha única). */
export function SiteSettingsForm() {
  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings);
  const [saved, setSaved] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const current = await adminGetSiteSettings();
        setForm(current);
        setSaved(current);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dirty = saved !== null && form.hero_titulo !== saved.hero_titulo;
  const heroPreview = form.hero_titulo.trim() || defaultSiteSettings.hero_titulo;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hero_titulo.trim()) {
      setError("O título do hero não pode ficar vazio.");
      return;
    }
    setSaving(true);
    setError(null);
    setOk(false);
    try {
      const result = await adminSaveSiteSettings(form);
      setForm(result);
      setSaved(result);
      setOk(true);
      window.setTimeout(() => setOk(false), 2500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Configurações" description="Textos e ajustes gerais da loja." />
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="space-y-4 border border-border bg-surface/40 p-4 sm:p-5">
            <h2 className="font-display text-sm font-black uppercase tracking-wider">Hero da home</h2>
            <Field
              label="Título"
              htmlFor="hero-titulo"
              hint="Use Enter para quebrar linhas. Com mais de uma linha, a última aparece só com contorno."
            >
              <Textarea
                id="hero-titulo"
                value={form.hero_titulo}
                onChange={(e) => setForm((f) => ({ ...f, hero_titulo: e.target.value }))}
                maxLength={120}
                rows={3}
                required
                className="font-display font-bold uppercase"
              />
            </Field>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving} disabled={!dirty && !ok}>
                {ok ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {ok ? "Salvo" : "Salvar"}
              </Button>
              {dirty && <span className="text-xs text-muted">Alterações não salvas</span>}
            </div>
          </section>

          <div className="border border-border">
            <p className="border-b border-border bg-surface px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Prévia
            </p>
            <div className="overflow-hidden bg-grid px-5 py-8">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                Drop 09 · 2026 — Coleção nova no ar
              </p>
              <HeroTitle text={heroPreview} className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl" />
            </div>
          </div>
        </form>
      )}
    </>
  );
}
