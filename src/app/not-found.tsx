import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Erro 404</p>
      <h1 className="mt-3 font-display text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl">
        Página não encontrada
      </h1>
      <Link href="/" className={`${buttonVariants({ variant: "primary" })} mt-8`}>
        Voltar ao início
      </Link>
    </div>
  );
}
