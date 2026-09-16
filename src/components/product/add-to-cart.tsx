"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, MessageCircle, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { getEffectivePrice, getTotalStock, sortSizes } from "@/lib/products";
import { unique } from "@/lib/utils";
import { buildProductInquiryLink } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { SizeSelector } from "./size-selector";
import { ColorSelector } from "./color-selector";

export function AddToCart({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);

  const sizes = useMemo(() => sortSizes(unique(product.variantes.map((v) => v.tamanho))), [product]);
  const colors = useMemo(() => unique(product.variantes.map((v) => v.cor)), [product]);

  const [tamanho, setTamanho] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [cor, setCor] = useState<string | null>(colors.length === 1 ? colors[0] : null);
  const [quantidade, setQuantidade] = useState(1);
  const [added, setAdded] = useState(false);
  const [touched, setTouched] = useState(false);
  // URL completa só existe no cliente — evita mismatch de hidratação
  const [productUrl, setProductUrl] = useState<string | undefined>(undefined);
  useEffect(() => setProductUrl(window.location.href), []);

  const variant = product.variantes.find((v) => v.tamanho === tamanho && v.cor === cor) ?? null;
  const esgotado = getTotalStock(product) === 0;
  const maxQty = variant ? Math.max(0, variant.estoque) : 0;
  const preco = getEffectivePrice(product);

  // Ajusta a quantidade quando a variante muda
  useEffect(() => {
    if (maxQty > 0) setQuantidade((q) => Math.min(q, maxQty));
  }, [maxQty]);

  const sizeAvailable = (s: string) =>
    product.variantes.some((v) => v.tamanho === s && v.estoque > 0 && (!cor || v.cor === cor));
  const colorAvailable = (c: string) =>
    product.variantes.some((v) => v.cor === c && v.estoque > 0 && (!tamanho || v.tamanho === tamanho));

  const handleAdd = () => {
    setTouched(true);
    if (!variant || variant.estoque <= 0) return;
    addItem(
      {
        productId: product.id,
        variantId: variant.id,
        slug: product.slug,
        nome: product.nome,
        imagem: product.imagens[0]?.url ?? null,
        tamanho: variant.tamanho,
        cor: variant.cor,
        preco,
        estoque: variant.estoque,
      },
      quantidade,
    );
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label>Tamanho{tamanho ? `: ${tamanho}` : ""}</Label>
          {touched && !tamanho && <span className="text-xs text-promo">Escolha um tamanho</span>}
        </div>
        <SizeSelector sizes={sizes} value={tamanho} onChange={setTamanho} isAvailable={sizeAvailable} />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label>Cor{cor ? `: ${cor}` : ""}</Label>
          {touched && !cor && <span className="text-xs text-promo">Escolha uma cor</span>}
        </div>
        <ColorSelector colors={colors} value={cor} onChange={setCor} isAvailable={colorAvailable} />
      </div>

      {variant && (
        <p className="text-xs text-muted" aria-live="polite">
          {variant.estoque > 0
            ? variant.estoque <= 3
              ? `Últimas ${variant.estoque} ${variant.estoque === 1 ? "unidade" : "unidades"}!`
              : `${variant.estoque} unidades disponíveis`
            : "Combinação esgotada — escolha outra opção."}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <QuantityStepper value={quantidade} min={1} max={Math.max(1, maxQty)} onChange={setQuantidade} />
        <Button
          size="md"
          block
          onClick={handleAdd}
          disabled={esgotado || (variant !== null && variant.estoque <= 0)}
          variant={added ? "light" : "primary"}
          className="sm:flex-1"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Adicionado
            </>
          ) : esgotado ? (
            "Esgotado"
          ) : variant && variant.estoque <= 0 ? (
            "Indisponível"
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Adicionar ao carrinho
            </>
          )}
        </Button>
      </div>

      <a
        href={buildProductInquiryLink(product.nome, productUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
      >
        <MessageCircle className="h-4 w-4" /> Dúvidas? Perguntar no WhatsApp
      </a>
    </div>
  );
}
