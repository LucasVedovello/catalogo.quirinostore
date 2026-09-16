"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminSession } from "./admin-guard";

const NAV = [
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/banners", label: "Banners" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, signOut } = useAdminSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/admin/produtos" className="font-display text-lg font-black uppercase tracking-tighter">
            QUIRINO<span className="text-primary">.</span>ADMIN
          </Link>

          <nav className="ml-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-colors",
                    active ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1 px-3 py-2 text-xs text-muted hover:text-foreground sm:inline-flex"
            >
              Ver loja <ExternalLink className="h-3 w-3" />
            </Link>
            <span className="hidden max-w-40 truncate text-xs text-muted md:inline" title={session.user.email}>
              {session.user.email}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs text-muted hover:text-danger"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string | null; onDismiss?: () => void }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-3 border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-xs underline">
          fechar
        </button>
      )}
    </div>
  );
}
