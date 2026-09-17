import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { getDiscountPercent, getProductBySlug, getProducts, getTotalStock } from "@/lib/products";
import { formatPrice, isNewProduct } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { SectionHeading } from "@/components/ui/section-heading";
import { Gallery } from "@/components/product/gallery";
import { AddToCart } from "@/components/product/add-to-cart";
import { ProductRow } from "@/components/catalog/product-grid";

interface ProdutoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };

  const description =
    product.descricao?.slice(0, 160) ??
    `${product.nome} por ${formatPrice(product.preco)}. Peça pelo WhatsApp.`;

  return {
    title: product.nome,
    description,
    openGraph: {
      title: product.nome,
      description,
      images: product.imagens[0] ? [{ url: product.imagens[0].url }] : [],
    },
  };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const desconto = getDiscountPercent(product);
  const esgotado = getTotalStock(product) === 0;
  const novo = isNewProduct(product.criado_em);

  const relacionados = product.categoria
    ? (await getProducts({ categoria: product.categoria.slug })).filter((p) => p.id !== product.id).slice(0, 8)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted">
        <Link href="/" className="hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/produtos" className="hover:text-foreground">
          Produtos
        </Link>
        {product.categoria && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/produtos?categoria=${product.categoria.slug}`} className="hover:text-foreground">
              {product.categoria.nome}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-foreground">{product.nome}</span>
      </nav>

      {/* key={product.id}: remonta (e reanima) ao navegar entre produtos relacionados. */}
      <div key={product.id} className="grid gap-8 animate-scale-in lg:grid-cols-2 lg:gap-12">
        <Gallery
          images={product.imagens}
          alt={product.nome}
          badge={
            <>
              {desconto !== null && <Badge variant="promo">-{desconto}%</Badge>}
              {product.eh_mais_vendido && <Badge variant="primary">Mais vendido</Badge>}
              {novo && <Badge variant="light">Novo</Badge>}
              {esgotado && <Badge variant="muted">Esgotado</Badge>}
            </>
          }
        />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            {product.marca ?? product.categoria?.nome ?? "Quirino Store"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-4xl">
            {product.nome}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Price product={product} size="lg" />
            {desconto !== null && <Badge variant="promo">Economize {desconto}%</Badge>}
          </div>
          <p className="mt-1 text-xs text-muted">Pagamento combinado direto no WhatsApp.</p>

          <div className="mt-8">
            <AddToCart product={product} />
          </div>

          {product.descricao && (
            <div className="mt-10 border-t border-border pt-6">
              <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.25em] text-muted">
                Descrição
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {product.descricao}
              </p>
            </div>
          )}

          <ul className="mt-8 grid gap-2 text-xs text-muted sm:grid-cols-2">
            <li className="flex items-center gap-2 border border-border px-3 py-2">
              <Truck className="h-4 w-4 shrink-0 text-primary" /> Envio para todo o Brasil
            </li>
            <li className="flex items-center gap-2 border border-border px-3 py-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-primary" /> Pedido e pagamento pelo WhatsApp
            </li>
            <li className="flex items-center gap-2 border border-border px-3 py-2">
              <RefreshCcw className="h-4 w-4 shrink-0 text-primary" /> Troca em até 7 dias
            </li>
            <li className="flex items-center gap-2 border border-border px-3 py-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> Estoque atualizado
            </li>
          </ul>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            eyebrow={product.categoria?.nome}
            title="Você também pode curtir"
            href={`/produtos?categoria=${product.categoria?.slug ?? ""}`}
            linkLabel="Ver categoria"
          />
          <ProductRow products={relacionados} />
        </section>
      )}
    </div>
  );
}
