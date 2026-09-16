import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return brl.format(Number.isFinite(value) ? value : 0);
}

/** Igual a formatPrice, mas com espaço comum (o Intl usa NBSP) — melhor para mensagens de texto. */
export function formatPricePlain(value: number): string {
  return formatPrice(value).replace(/ /g, " ");
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Máscara de telefone BR: (11) 99999-9999 ou (11) 9999-9999 */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Remove acentos e baixa a caixa — usado para busca tolerante. */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function isNewProduct(criadoEm: string, days = 30): boolean {
  const created = new Date(criadoEm).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < days * 24 * 60 * 60 * 1000;
}
