import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getAllSizes,
  getCategories,
  getPriceRange,
  getProducts,
  parseFilters,
} from "@/lib/products";
import { Filters } from "@/components/catalog/filters";
import { ProductGrid } from "@/components/catalog/product-grid";

interface ProdutosPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Produtos",
  description: "Todos os produtos do catálogo — filtre por categoria, tamanho e preço.",
};

const TAG_TITLES: Record<string, string> = {
  promocao: "Promoções",
  "mais-vendidos": "Mais vendidos",
  destaques: "Destaques",
};

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  const filters = parseFilters(await searchParams);

  const [products, categories, sizes, priceRange] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getAllSizes(),
    getPriceRange(),
  ]);

  const categoriaAtual = filters.categoria
    ? categories.find((c) => c.slug === filters.categoria)
    : undefined;

  const title = filters.busca
    ? `Resultados para “${filters.busca}”`
    : categoriaAtual?.nome ?? (filters.tag ? TAG_TITLES[filters.tag] : undefined) ?? "Todos os produtos";

  const eyebrow = filters.busca
    ? "Busca"
    : categoriaAtual
      ? "Categoria"
      : filters.tag
        ? "Seleção"
        : "Catálogo";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <header className="mb-6 border-b border-border pb-4">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="font-display text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-muted lg:hidden">
            {products.length} {products.length === 1 ? "produto" : "produtos"}
          </p>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <Suspense fallback={null}>
          <Filters
            categories={categories}
            sizes={sizes}
            priceRange={priceRange}
            resultCount={products.length}
          />
        </Suspense>

        <ProductGrid
          products={products}
          emptyTitle={filters.busca ? `Nada para “${filters.busca}”` : "Nenhum produto encontrado"}
        />
      </div>
    </div>
  );
}
