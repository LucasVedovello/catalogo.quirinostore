import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { Product } from "@/types";
import { getAvailableSizes, getDiscountPercent, getTotalStock } from "@/lib/products";
import { cn, isNewProduct } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Prioriza o carregamento da imagem (itens acima da dobra). */
  priority?: boolean;
  sizes?: string;
}

export function ProductCard({
  product,
  className,
  priority,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: ProductCardProps) {
  const [img1, img2] = product.imagens;
  const desconto = getDiscountPercent(product);
  const esgotado = getTotalStock(product) === 0;
  const novo = isNewProduct(product.criado_em);
  const tamanhos = getAvailableSizes(product);

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className={cn(
        "group flex flex-col border border-border bg-surface transition-colors hover:border-foreground/40",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
        {img1 ? (
          <>
            <Image
              src={img1.url}
              alt={product.nome}
              fill
              sizes={sizes}
              priority={priority}
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-[1.04]",
                img2 && "group-hover:opacity-0",
                esgotado && "opacity-60 grayscale",
              )}
            />
            {img2 && (
              <Image
                src={img2.url}
                alt=""
                fill
                sizes={sizes}
                className={cn(
                  "object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  esgotado && "grayscale",
                )}
                aria-hidden
              />
            )}
          </>
        ) : (
          <div className="grid h-full w-full place-items-center text-muted">
            <ImageOff className="h-8 w-8" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {desconto !== null && <Badge variant="promo">-{desconto}%</Badge>}
          {product.eh_mais_vendido && <Badge variant="primary">Mais vendido</Badge>}
          {novo && !product.eh_mais_vendido && <Badge variant="light">Novo</Badge>}
        </div>

        {esgotado && (
          <div className="absolute inset-x-0 bottom-0 bg-background/85 py-1.5 text-center font-display text-[11px] font-black uppercase tracking-[0.2em]">
            Esgotado
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="truncate text-[11px] uppercase tracking-wider text-muted">
          {product.marca ?? product.categoria?.nome ?? " "}
        </p>
        <h3 className="line-clamp-2 font-display text-sm font-bold uppercase leading-tight">
          {product.nome}
        </h3>
        <div className="mt-auto pt-1">
          <Price product={product} size="sm" />
        </div>
        {tamanhos.length > 0 && (
          <p className="truncate text-[10px] uppercase tracking-wider text-muted">
            {tamanhos.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
