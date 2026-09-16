import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import type { Category } from "@/types";
import { buildGenericContactLink, INSTAGRAM_HANDLE, STORE_NAME } from "@/lib/whatsapp";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <p className="font-display text-2xl font-black uppercase tracking-tighter">
            QUIRINO<span className="text-primary">.</span>STORE
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Streetwear selecionado, sem enrolação. Escolha as peças, monte o carrinho e finalize o
            pedido direto com a gente no WhatsApp.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={buildGenericContactLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 bg-[#25D366] px-4 font-display text-xs font-bold uppercase tracking-wider text-[#062e16]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            {INSTAGRAM_HANDLE && (
              <a
                href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-border px-4 font-display text-xs font-bold uppercase tracking-wider hover:bg-surface-2"
              >
                <InstagramIcon className="h-4 w-4" /> Instagram
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.25em] text-muted">
            Categorias
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/produtos" className="hover:text-primary">
                Todos os produtos
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/produtos?categoria=${c.slug}`} className="hover:text-primary">
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.25em] text-muted">
            Como funciona
          </p>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <span className="font-display font-black text-foreground">01</span> Escolha tamanho e
              cor
            </li>
            <li>
              <span className="font-display font-black text-foreground">02</span> Adicione ao
              carrinho
            </li>
            <li>
              <span className="font-display font-black text-foreground">03</span> Finalize e envie
              pelo WhatsApp
            </li>
            <li>
              <span className="font-display font-black text-foreground">04</span> Combine pagamento
              e entrega com a gente
            </li>
          </ol>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {STORE_NAME}. Todos os direitos reservados.
          </p>
          <Link href="/admin/login" className="hover:text-foreground">
            Área do lojista
          </Link>
        </div>
      </div>
    </footer>
  );
}
