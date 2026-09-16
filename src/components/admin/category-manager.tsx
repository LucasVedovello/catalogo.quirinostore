"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Category } from "@/types";
import { adminDeleteCategory, adminListCategories, adminSaveCategory } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { AdminPageHeader, ErrorBanner } from "./admin-shell";

interface Draft {
  nome: string;
  slug: string;
  ordem: string;
}

const emptyDraft = (ordem = 0): Draft => ({ nome: "", slug: "", ordem: String(ordem) });

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft());
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminListCategories();
      setCategories(list);
      setCreating(emptyDraft(list.length + 1));
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

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating.nome.trim().length < 2) return;
    setSaving(true);
    try {
      const saved = await adminSaveCategory({
        nome: creating.nome,
        slug: creating.slug || slugify(creating.nome),
        ordem: parseInt(creating.ordem || "0", 10) || 0,
      });
      const next = [...categories, saved].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome));
      setCategories(next);
      setCreating(emptyDraft(next.length + 1));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditDraft({ nome: c.nome, slug: c.slug, ordem: String(c.ordem) });
  };

  const saveEdit = async (c: Category) => {
    setBusyId(c.id);
    try {
      const saved = await adminSaveCategory({
        id: c.id,
        nome: editDraft.nome,
        slug: editDraft.slug || slugify(editDraft.nome),
        ordem: parseInt(editDraft.ordem || "0", 10) || 0,
      });
      setCategories((list) =>
        list.map((x) => (x.id === c.id ? saved : x)).sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)),
      );
      setEditingId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (c: Category) => {
    if (!window.confirm(`Excluir a categoria "${c.nome}"? Os produtos dela ficam sem categoria.`)) return;
    setBusyId(c.id);
    try {
      await adminDeleteCategory(c.id);
      setCategories((list) => list.filter((x) => x.id !== c.id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <AdminPageHeader title="Categorias" description="Aparecem no menu, nos filtros e no rodapé, na ordem definida." />
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <form onSubmit={create} className="mb-6 grid gap-3 border border-border bg-surface/40 p-4 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
        <Field label="Nome" htmlFor="cat-nome">
          <Input
            id="cat-nome"
            value={creating.nome}
            onChange={(e) => setCreating((d) => ({ ...d, nome: e.target.value, slug: slugify(e.target.value) }))}
            placeholder="Ex.: Camisetas"
            required
          />
        </Field>
        <Field label="Slug" htmlFor="cat-slug">
          <Input
            id="cat-slug"
            value={creating.slug}
            onChange={(e) => setCreating((d) => ({ ...d, slug: e.target.value }))}
            onBlur={() => setCreating((d) => ({ ...d, slug: slugify(d.slug) }))}
            placeholder="camisetas"
          />
        </Field>
        <Field label="Ordem" htmlFor="cat-ordem">
          <Input
            id="cat-ordem"
            type="number"
            min={0}
            value={creating.ordem}
            onChange={(e) => setCreating((d) => ({ ...d, ordem: e.target.value }))}
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
      ) : categories.length === 0 ? (
        <p className="border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
          Nenhuma categoria ainda. Crie a primeira acima.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {categories.map((c) => {
            const editing = editingId === c.id;
            const busy = busyId === c.id;
            return (
              <li key={c.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[60px_1fr_1fr_auto] sm:items-center">
                {editing ? (
                  <>
                    <Input
                      type="number"
                      min={0}
                      value={editDraft.ordem}
                      onChange={(e) => setEditDraft((d) => ({ ...d, ordem: e.target.value }))}
                      className="h-9"
                      aria-label="Ordem"
                    />
                    <Input
                      value={editDraft.nome}
                      onChange={(e) => setEditDraft((d) => ({ ...d, nome: e.target.value }))}
                      className="h-9"
                      aria-label="Nome"
                    />
                    <Input
                      value={editDraft.slug}
                      onChange={(e) => setEditDraft((d) => ({ ...d, slug: e.target.value }))}
                      onBlur={() => setEditDraft((d) => ({ ...d, slug: slugify(d.slug) }))}
                      className="h-9"
                      aria-label="Slug"
                    />
                    <div className="flex justify-end gap-1">
                      <Button size="icon-sm" variant="primary" onClick={() => saveEdit(c)} loading={busy} aria-label="Salvar">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancelar">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-display text-sm font-black text-muted">#{c.ordem}</span>
                    <span className="font-display font-bold uppercase">{c.nome}</span>
                    <span className="truncate text-sm text-muted">/produtos?categoria={c.slug}</span>
                    <div className="flex justify-end gap-1">
                      <Button size="icon-sm" variant="ghost" onClick={() => startEdit(c)} aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => remove(c)}
                        loading={busy}
                        aria-label="Excluir"
                        className="hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
