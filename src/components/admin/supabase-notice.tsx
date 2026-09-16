import { AlertTriangle } from "lucide-react";

export function SupabaseNotice() {
  return (
    <div className="border border-promo/50 bg-promo/10 p-5 text-sm">
      <div className="flex items-center gap-2 font-display text-base font-black uppercase text-promo">
        <AlertTriangle className="h-5 w-5" /> Supabase não configurado
      </div>
      <p className="mt-2 text-foreground/90">
        O painel administrativo precisa do Supabase (Auth, banco e Storage). Preencha em{" "}
        <code className="bg-surface px-1">.env.local</code>:
      </p>
      <pre className="mt-3 overflow-x-auto bg-surface p-3 text-xs text-muted">
        {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
      </pre>
      <p className="mt-3 text-muted">
        Depois rode o SQL de <code className="bg-surface px-1">supabase/schema.sql</code> no projeto e crie um
        usuário em Authentication → Users. Enquanto isso, a loja funciona com os produtos de exemplo.
      </p>
    </div>
  );
}
