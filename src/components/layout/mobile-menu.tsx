"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowUpRight, Flame, MessageCircle, Star, X } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import { buildGenericContactLink, INSTAGRAM_HANDLE } from "@/lib/whatsapp";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}

export function MobileMenu({ open, onClose, categories }: MobileMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("categoria");
  const currentTag = searchParams.get("tag");

  // Fecha ao navegar
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Esc + trava scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const itemClass =
    "flex items-center justify-between border-b border-border px-5 py-4 font-display text-lg font-black uppercase tracking-tight transition-colors hover:bg-surface-2";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/70 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-sm flex-col border-r border-border bg-background transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-muted">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 grid h-10 w-10 place-items-center hover:bg-surface-2"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <Link
            href="/produtos"
            className={cn(itemClass, pathname === "/produtos" && !currentCategory && !currentTag && "text-primary")}
          >
            Todos os produtos <ArrowUpRight className="h-4 w-4 text-muted" />
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/produtos?categoria=${c.slug}`}
              className={cn(itemClass, currentCategory === c.slug && "text-primary")}
            >
              {c.nome} <ArrowUpRight className="h-4 w-4 text-muted" />
            </Link>
          ))}
          <Link
            href="/produtos?tag=promocao"
            className={cn(itemClass, "text-promo", currentTag === "promocao" && "bg-promo/10")}
          >
            Promoções <Flame className="h-4 w-4" />
          </Link>
          <Link
            href="/produtos?tag=mais-vendidos"
            className={cn(itemClass, currentTag === "mais-vendidos" && "text-primary")}
          >
            Mais vendidos <Star className="h-4 w-4 text-muted" />
          </Link>
        </nav>

        <div className="space-y-2 border-t border-border p-5">
          <a
            href={buildGenericContactLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366] px-4 py-3 font-display text-sm font-bold uppercase tracking-wide text-[#062e16]"
          >
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
          </a>
          {INSTAGRAM_HANDLE && (
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 border border-border px-4 py-3 font-display text-sm font-bold uppercase tracking-wide"
            >
              <InstagramIcon className="h-4 w-4" /> @{INSTAGRAM_HANDLE}
            </a>
          )}
        </div>
      </aside>
    </>
  );
}
