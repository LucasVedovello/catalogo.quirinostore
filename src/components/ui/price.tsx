import type { Product } from "@/types";
import { getEffectivePrice } from "@/lib/products";
import { cn, formatPrice } from "@/lib/utils";

interface PriceProps {
  product: Pick<Product, "preco" | "preco_promocional" | "eh_promocao">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { atual: "text-sm", antigo: "text-[11px]" },
  md: { atual: "text-base", antigo: "text-xs" },
  lg: { atual: "text-3xl", antigo: "text-base" },
};

export function Price({ product, size = "md", className }: PriceProps) {
  const atual = getEffectivePrice(product);
  const temDesconto = atual < product.preco;
  const s = sizes[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 font-display", className)}>
      <span className={cn("font-black tabular-nums", s.atual, temDesconto && "text-promo")}>
        {formatPrice(atual)}
      </span>
      {temDesconto && (
        <span className={cn("font-semibold text-muted line-through tabular-nums", s.antigo)}>
          {formatPrice(product.preco)}
        </span>
      )}
    </div>
  );
}
