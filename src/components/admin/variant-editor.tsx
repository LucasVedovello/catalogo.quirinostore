"use client";

import { useState } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface EditableVariant {
  id?: string;
  key: string;
  tamanho: string;
  cor: string;
  estoque: number;
}

interface VariantEditorProps {
  variants: EditableVariant[];
  onChange: (variants: EditableVariant[]) => void;
}

const PRESETS: { label: string; sizes: string[] }[] = [
  { label: "P–GG", sizes: ["P", "M", "G", "GG"] },
  { label: "PP–XGG", sizes: ["PP", "P", "M", "G", "GG", "XGG"] },
  { label: "Calça 38–46", sizes: ["38", "40", "42", "44", "46"] },
  { label: "Tênis 37–44", sizes: ["37", "38", "39", "40", "41", "42", "43", "44"] },
  { label: "Único", sizes: ["Único"] },
];

const newKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function newVariant(partial: Partial<EditableVariant> = {}): EditableVariant {
  return { key: newKey(), tamanho: "", cor: "", estoque: 0, ...partial };
}

/** Grade tamanho × cor × estoque. O estoque é sempre por variante. */
export function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const [presetColor, setPresetColor] = useState("");

  const update = (key: string, patch: Partial<EditableVariant>) =>
    onChange(variants.map((v) => (v.key === key ? { ...v, ...patch } : v)));

  const remove = (key: string) => onChange(variants.filter((v) => v.key !== key));

  const applyPreset = (sizes: string[]) => {
    const cor = presetColor.trim();
    const existing = new Set(variants.map((v) => `${v.tamanho.trim().toUpperCase()}|${v.cor.trim().toUpperCase()}`));
    const additions = sizes
      .filter((s) => !existing.has(`${s.toUpperCase()}|${cor.toUpperCase()}`))
      .map((s) => newVariant({ tamanho: s, cor, estoque: 0 }));
    onChange([...variants, ...additions]);
  };

  // Detecta duplicatas para sinalizar
  const counts = variants.reduce<Record<string, number>>((acc, v) => {
    const k = `${v.tamanho.trim().toUpperCase()}|${v.cor.trim().toUpperCase()}`;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const isDuplicate = (v: EditableVariant) =>
    counts[`${v.tamanho.trim().toUpperCase()}|${v.cor.trim().toUpperCase()}`] > 1;

  const total = variants.reduce((a, v) => a + (Number(v.estoque) || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 border border-border bg-surface p-3">
        <Wand2 className="h-4 w-4 text-muted" />
        <span className="text-xs text-muted">Gerar grade:</span>
        <Input
          value={presetColor}
          onChange={(e) => setPresetColor(e.target.value)}
          placeholder="Cor (ex.: Preto)"
          className="h-9 w-36 text-xs"
        />
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p.sizes)}
            className="border border-border bg-background px-2.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider hover:border-primary hover:text-primary"
          >
            {p.label}
          </button>
        ))}
      </div>

      {variants.length > 0 && (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-surface text-left font-display text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2">Tamanho</th>
                <th className="px-3 py-2">Cor</th>
                <th className="w-32 px-3 py-2">Estoque</th>
                <th className="w-12 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((v) => {
                const dup = isDuplicate(v);
                return (
                  <tr key={v.key} className={cn(dup && "bg-danger/10")}>
                    <td className="px-2 py-1.5">
                      <Input
                        value={v.tamanho}
                        onChange={(e) => update(v.key, { tamanho: e.target.value })}
                        placeholder="M"
                        className="h-9 text-sm uppercase"
                        aria-invalid={dup || !v.tamanho.trim()}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        value={v.cor}
                        onChange={(e) => update(v.key, { cor: e.target.value })}
                        placeholder="Preto"
                        className="h-9 text-sm"
                        aria-invalid={dup || !v.cor.trim()}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={Number.isFinite(v.estoque) ? v.estoque : 0}
                        onChange={(e) => update(v.key, { estoque: Math.max(0, parseInt(e.target.value || "0", 10)) })}
                        className={cn("h-9 text-sm tabular-nums", v.estoque === 0 && "text-promo")}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => remove(v.key)}
                        className="grid h-8 w-8 place-items-center text-muted hover:bg-danger/10 hover:text-danger"
                        aria-label="Remover variante"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...variants, newVariant()])}>
          <Plus className="h-4 w-4" /> Adicionar variante
        </Button>
        <p className="text-xs text-muted">
          {variants.length} {variants.length === 1 ? "variante" : "variantes"} · estoque total{" "}
          <span className="font-display font-bold text-foreground">{total}</span>
        </p>
      </div>

      {Object.values(counts).some((c) => c > 1) && (
        <p className="text-xs text-danger">Há combinações tamanho + cor repetidas. Cada combinação deve ser única.</p>
      )}
    </div>
  );
}
