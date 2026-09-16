import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, RefreshCcw, Truck } from "lucide-react";
import { getCategories, getHomeSections } from "@/lib/products";
import { buildGenericContactLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductRow } from "@/components/catalog/product-grid";

export default async function HomePage() {
  const [sections, categories] = await Promise.all([getHomeSections(), getCategories()]);
  const heroProducts = [...sections.destaques, ...sections.maisVendidos, ...sections.novidades]
    .filter((p, i, arr) => p.imagens[0] && arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-grid">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-20">
          <div className="min-w-0 animate-slide-up">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
              Drop 09 · 2026 — Coleção nova no ar
            </p>
            <h1 className="mt-4 break-words font-display text-[2.75rem] font-black uppercase leading-[0.88] tracking-tighter sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Street
              <br />
              wear
              <br />
              <span className="text-outline">sem enrolação.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted">
              Peças selecionadas, estoque real e pedido direto no WhatsApp. Escolha, monte o carrinho
              e a gente cuida do resto.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/produtos" className={buttonVariants({ variant: "primary", size: "lg" })}>
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/produtos?tag=promocao"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Promoções
              </Link>
            </div>

            <ul className="mt-10 grid grid-cols-1 gap-3 text-xs text-muted sm:grid-cols-3">
              <li className="flex items-center gap-2 border border-border bg-surface/60 px-3 py-2">
                <Truck className="h-4 w-4 shrink-0 text-primary" /> Envio para todo o Brasil
              </li>
              <li className="flex items-center gap-2 border border-border bg-surface/60 px-3 py-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-primary" /> Pedido pelo WhatsApp
              </li>
              <li className="flex items-center gap-2 border border-border bg-surface/60 px-3 py-2">
                <RefreshCcw className="h-4 w-4 shrink-0 text-primary" /> Troca em até 7 dias
              </li>
            </ul>
          </div>

          {heroProducts.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-2">
              {heroProducts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/produtos/${p.slug}`}
                  className={cn(
                    "group relative overflow-hidden border border-border bg-surface",
                    i === 0 ? "aspect-[3/4] lg:row-span-2 lg:aspect-auto" : "aspect-[3/4] lg:aspect-[4/5]",
                  )}
                >
                  <Image
                    src={p.imagens[0].url}
                    alt={p.nome}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2 sm:p-3">
                    <p className="truncate font-display text-[10px] font-black uppercase tracking-wide text-white sm:text-xs">
                      {p.nome}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/produtos?categoria=${c.slug}`}
                className="shrink-0 border border-border bg-surface px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-colors hover:border-primary hover:text-primary"
              >
                {c.nome}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-10">
        {sections.maisVendidos.length > 0 && (
          <section>
            <SectionHeading eyebrow="Top da galera" title="Mais vendidos" href="/produtos?tag=mais-vendidos" />
            <ProductRow products={sections.maisVendidos} />
          </section>
        )}

        {sections.novidades.length > 0 && (
          <section>
            <SectionHeading eyebrow="Acabou de chegar" title="Novidades" href="/produtos?ordenar=recentes" />
            <ProductRow products={sections.novidades} />
          </section>
        )}

        {sections.promocoes.length > 0 && (
          <section>
            <SectionHeading eyebrow="Preço baixo" title="Promoções" href="/produtos?tag=promocao" />
            <ProductRow products={sections.promocoes} />
          </section>
        )}

        {sections.destaques.length > 0 && (
          <section>
            <SectionHeading eyebrow="Seleção da loja" title="Destaques" href="/produtos?tag=destaques" />
            <ProductRow products={sections.destaques} />
          </section>
        )}

        {/* CTA WHATSAPP */}
        <section className="grid gap-6 border border-border bg-surface p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
              Atendimento humano
            </p>
            <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
              Não achou o que queria?
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted">
              Chama no WhatsApp que a gente te ajuda a escolher tamanho, confere estoque e separa sua
              peça.
            </p>
          </div>
          <a
            href={buildGenericContactLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "whatsapp", size: "lg" })}
          >
            <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
          </a>
        </section>
      </div>
    </>
  );
}
