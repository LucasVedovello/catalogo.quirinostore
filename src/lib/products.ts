import type {
  Banner,
  Category,
  HomeSections,
  Product,
  ProductFilters,
  ProductSort,
  ProductTag,
  ProductVariant,
} from "@/types";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import { mockBanners, mockCategories, mockProducts } from "./mock-data";
import { normalizeText, unique } from "./utils";

/**
 * Camada de dados do catálogo.
 * - Sem NEXT_PUBLIC_SUPABASE_URL / ANON_KEY → usa mock-data.ts
 * - Com as variáveis → consulta o Supabase
 *
 * Filtros/ordenação são aplicados em JS (applyFilters) para que o comportamento
 * seja idêntico nas duas fontes. Catálogo de loja pequena: buscar tudo e filtrar
 * localmente é mais simples e mais barato que compor queries dinâmicas.
 */

/** Select com os joins usados em todo o app (também no admin). */
export const PRODUCT_SELECT =
  "*, categoria:categories(*), imagens:product_images(*), variantes:product_variants(*)";

const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XG", "XGG", "XXG", "XXXG", "U", "ÚNICO", "UNICO"];

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b, "pt-BR");
  });
}

function sortVariants(variants: ProductVariant[]): ProductVariant[] {
  const order = sortSizes(unique(variants.map((v) => v.tamanho)));
  return [...variants].sort((a, b) => {
    const d = order.indexOf(a.tamanho) - order.indexOf(b.tamanho);
    return d !== 0 ? d : a.cor.localeCompare(b.cor, "pt-BR");
  });
}

/** Normaliza uma linha vinda do Supabase (numeric chega como string) para o tipo Product. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProduct(raw: any): Product {
  const imagens = [...(raw.imagens ?? [])].sort((a, b) => a.ordem - b.ordem);
  const variantes = sortVariants(
    (raw.variantes ?? []).map((v: ProductVariant) => ({ ...v, estoque: Number(v.estoque) || 0 })),
  );
  return {
    ...raw,
    preco: Number(raw.preco) || 0,
    preco_promocional:
      raw.preco_promocional === null || raw.preco_promocional === undefined
        ? null
        : Number(raw.preco_promocional),
    categoria: raw.categoria ?? null,
    imagens,
    variantes,
  };
}

/* ---------- Helpers de preço/estoque ---------- */

export function getEffectivePrice(
  p: Pick<Product, "preco" | "preco_promocional" | "eh_promocao">,
): number {
  if (p.eh_promocao && p.preco_promocional !== null && p.preco_promocional < p.preco) {
    return p.preco_promocional;
  }
  return p.preco;
}

export function getDiscountPercent(
  p: Pick<Product, "preco" | "preco_promocional" | "eh_promocao">,
): number | null {
  const atual = getEffectivePrice(p);
  if (atual >= p.preco || p.preco <= 0) return null;
  return Math.round((1 - atual / p.preco) * 100);
}

export function getTotalStock(p: Pick<Product, "variantes">): number {
  return p.variantes.reduce((acc, v) => acc + Math.max(0, v.estoque), 0);
}

export function getAvailableSizes(p: Pick<Product, "variantes">): string[] {
  return sortSizes(unique(p.variantes.filter((v) => v.estoque > 0).map((v) => v.tamanho)));
}

export function getAvailableColors(p: Pick<Product, "variantes">): string[] {
  return unique(p.variantes.filter((v) => v.estoque > 0).map((v) => v.cor));
}

/* ---------- Filtros ---------- */

const SORTS: ProductSort[] = ["recentes", "menor-preco", "maior-preco", "nome"];
const TAGS: ProductTag[] = ["promocao", "mais-vendidos", "destaques"];

function toNumber(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Converte os searchParams da página /produtos em ProductFilters. */
export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ProductFilters {
  const first = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const ordenar = first("ordenar") as ProductSort | undefined;
  const tag = first("tag") as ProductTag | undefined;
  return {
    busca: first("busca")?.trim() || undefined,
    categoria: first("categoria")?.trim() || undefined,
    tamanho: first("tamanho")?.trim() || undefined,
    precoMin: toNumber(first("precoMin")),
    precoMax: toNumber(first("precoMax")),
    ordenar: ordenar && SORTS.includes(ordenar) ? ordenar : undefined,
    tag: tag && TAGS.includes(tag) ? tag : undefined,
  };
}

export function applyFilters(products: Product[], f: ProductFilters = {}): Product[] {
  let list = products.filter((p) => p.ativo);

  if (f.tag === "promocao") list = list.filter((p) => getDiscountPercent(p) !== null);
  if (f.tag === "mais-vendidos") list = list.filter((p) => p.eh_mais_vendido);
  if (f.tag === "destaques") list = list.filter((p) => p.eh_destaque);

  if (f.categoria) list = list.filter((p) => p.categoria?.slug === f.categoria);

  if (f.tamanho) {
    const size = f.tamanho.toUpperCase();
    list = list.filter((p) =>
      p.variantes.some((v) => v.tamanho.toUpperCase() === size && v.estoque > 0),
    );
  }

  if (f.precoMin !== undefined) list = list.filter((p) => getEffectivePrice(p) >= f.precoMin!);
  if (f.precoMax !== undefined) list = list.filter((p) => getEffectivePrice(p) <= f.precoMax!);

  if (f.busca) {
    const terms = normalizeText(f.busca).split(/\s+/).filter(Boolean);
    list = list.filter((p) => {
      const haystack = normalizeText(
        [p.nome, p.marca ?? "", p.descricao ?? "", p.categoria?.nome ?? ""].join(" "),
      );
      return terms.every((t) => haystack.includes(t));
    });
  }

  const sort: ProductSort = f.ordenar ?? "recentes";
  list = [...list].sort((a, b) => {
    switch (sort) {
      case "menor-preco":
        return getEffectivePrice(a) - getEffectivePrice(b);
      case "maior-preco":
        return getEffectivePrice(b) - getEffectivePrice(a);
      case "nome":
        return a.nome.localeCompare(b.nome, "pt-BR");
      case "recentes":
      default:
        return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
    }
  });

  return list;
}

/* ---------- Fontes de dados ---------- */

async function fetchActiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return mockProducts;

  const { data, error } = await getSupabase()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("ativo", true)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("[products] erro ao buscar produtos:", error.message);
    return [];
  }
  return (data ?? []).map(normalizeProduct);
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const all = await fetchActiveProducts();
  return applyFilters(all, filters);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return mockProducts.find((p) => p.slug === slug && p.ativo) ?? null;
  }

  const { data, error } = await getSupabase()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    console.error("[products] erro ao buscar produto:", error.message);
    return null;
  }
  return data ? normalizeProduct(data) : null;
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return [...mockCategories].sort((a, b) => a.ordem - b.ordem);

  const { data, error } = await getSupabase()
    .from("categories")
    .select("*")
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (error) {
    console.error("[products] erro ao buscar categorias:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getBanners(): Promise<Banner[]> {
  if (!isSupabaseConfigured) {
    return mockBanners.filter((b) => b.ativo).sort((a, b) => a.ordem - b.ordem);
  }

  const { data, error } = await getSupabase()
    .from("banners")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("[products] erro ao buscar banners:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getHomeSections(limit = 8): Promise<HomeSections> {
  const all = applyFilters(await fetchActiveProducts(), { ordenar: "recentes" });
  return {
    maisVendidos: all.filter((p) => p.eh_mais_vendido).slice(0, limit),
    novidades: all.slice(0, limit),
    promocoes: all.filter((p) => getDiscountPercent(p) !== null).slice(0, limit),
    destaques: all.filter((p) => p.eh_destaque).slice(0, limit),
  };
}

/** Todos os tamanhos existentes em produtos ativos (para o filtro). */
export async function getAllSizes(): Promise<string[]> {
  const all = await fetchActiveProducts();
  return sortSizes(unique(all.flatMap((p) => p.variantes.map((v) => v.tamanho))));
}

export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const all = await fetchActiveProducts();
  if (all.length === 0) return { min: 0, max: 0 };
  const prices = all.map(getEffectivePrice);
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}
