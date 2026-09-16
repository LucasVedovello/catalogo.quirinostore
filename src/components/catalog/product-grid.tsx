import Link from "next/link";
import { PackageSearch } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  className,
  emptyTitle = "Nenhum produto encontrado",
  emptyDescription = "Tente remover algum filtro ou buscar por outro termo.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-border px-6 py-20 text-center">
        <PackageSearch className="mb-4 h-10 w-10 text-muted" />
        <h3 className="font-display text-lg font-black uppercase">{emptyTitle}</h3>
        <p className="mt-1 max-w-xs text-sm text-muted">{emptyDescription}</p>
        <Link href="/produtos" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-6")}>
          Ver todos os produtos
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}

/** Linha horizontal com scroll-snap — usada nas seções da home e em "relacionados". */
export function ProductRow({ products, className }: { products: Product[]; className?: string }) {
  if (products.length === 0) return null;
  return (
    <div
      className={cn(
        "-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide sm:gap-3",
        className,
      )}
    >
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          className="w-[64vw] shrink-0 snap-start sm:w-[260px] lg:w-[280px]"
          sizes="(max-width: 640px) 64vw, 280px"
        />
      ))}
    </div>
  );
}
