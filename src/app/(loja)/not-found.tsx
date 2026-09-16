import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Erro 404</p>
      <h1 className="mt-3 font-display text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl">
        Não <span className="text-outline">achamos</span>
        <br />
        essa peça.
      </h1>
      <p className="mt-4 max-w-sm text-sm text-muted">
        O produto pode ter saído de linha ou o link está errado. Dá uma olhada no catálogo completo.
      </p>
      <Link href="/produtos" className={`${buttonVariants({ variant: "primary" })} mt-8`}>
        Ver catálogo
      </Link>
    </div>
  );
}
