"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import { selectTotalItems, useCart } from "@/store/cart";
import { SearchBar } from "@/components/catalog/search";
import { MobileMenu } from "./mobile-menu";

/** Marca da loja no Supabase Storage (bucket público). Arte branca sobre preto sólido, sem transparência. */
const LOGO_URL =
  "https://ojugabhswoypzmkhowoj.supabase.co/storage/v1/object/public/public.logo-quirino.png/public/logo-quirino.png";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex shrink-0 items-center gap-2 sm:gap-2.5", className)}
      aria-label="Quirino Store — início"
    >
      {/* mix-blend-screen: o fundo preto do JPEG some sobre o header escuro e só o desenho branco fica. */}
      <span className="relative block h-7 w-7 shrink-0 overflow-hidden sm:h-8 sm:w-8" aria-hidden>
        <Image
          src={LOGO_URL}
          alt=""
          fill
          priority
          sizes="32px"
          className="scale-[1.08] object-cover mix-blend-screen"
        />
      </span>
      <span className="font-display text-xl font-black uppercase leading-none tracking-tighter">
        QUIRINO<span className="text-primary">.</span>STORE
      </span>
    </Link>
  );
}

export function Header({ categories }: { categories: Category[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = useCart(selectTotalItems);
  const openCart = useCart((s) => s.open);

  const navLinks = [
    { href: "/produtos", label: "Tudo" },
    ...categories
      .slice(0, 5)
      .map((c) => ({ href: `/produtos?categoria=${c.slug}`, label: c.nome })),
    { href: "/produtos?tag=promocao", label: "Promoções", promo: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:h-16">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 grid h-10 w-10 place-items-center hover:bg-surface-2 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo />

          <nav
            className="ml-8 hidden items-center gap-6 lg:flex"
            aria-label="Categorias"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-display text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-foreground",
                  link.promo && "text-promo hover:text-promo",
                  pathname === "/produtos" &&
                    link.href === "/produtos" &&
                    "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden w-72 md:block xl:w-80">
            <Suspense fallback={<div className="h-10 bg-surface" />}>
              <SearchBar />
            </Suspense>
          </div>

          <div className="ml-auto flex items-center md:ml-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center hover:bg-surface-2 md:hidden"
              aria-label={searchOpen ? "Fechar busca" : "Abrir busca"}
              aria-expanded={searchOpen}
            >
              {searchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={openCart}
              className="relative grid h-10 w-10 place-items-center hover:bg-surface-2"
              aria-label={`Abrir carrinho, ${totalItems} ${totalItems === 1 ? "item" : "itens"}`}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4.5 min-w-4.5 place-items-center bg-primary px-1 font-display text-[10px] font-black leading-none text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border px-4 py-2 md:hidden">
            <Suspense fallback={<div className="h-10 bg-surface" />}>
              <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
            </Suspense>
          </div>
        )}
      </header>

      {/* Fora do <header>: backdrop-filter cria containing block e prenderia o painel fixed à altura do header. */}
      <Suspense fallback={null}>
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          categories={categories}
        />
      </Suspense>
    </>
  );
}
