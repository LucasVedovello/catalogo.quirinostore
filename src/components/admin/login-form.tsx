"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { SupabaseNotice } from "./supabase-notice";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Já logado? Vai direto para o painel.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace("/admin/produtos");
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: authError } = await getSupabase().auth.signInWithPassword({ email, password });
    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : authError.message,
      );
      setLoading(false);
      return;
    }
    router.replace("/admin/produtos");
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a loja
        </Link>

        <p className="font-display text-2xl font-black uppercase tracking-tighter">
          QUIRINO<span className="text-primary">.</span>ADMIN
        </p>
        <p className="mt-1 text-sm text-muted">Acesso restrito ao lojista.</p>

        {!isSupabaseConfigured ? (
          <div className="mt-8">
            <SupabaseNotice />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 border border-border bg-surface/40 p-5">
            <Field label="E-mail" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Field>
            <Field label="Senha" htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" block loading={loading}>
              <Lock className="h-4 w-4" /> Entrar
            </Button>
            <p className="text-xs text-muted">
              O usuário é criado no painel do Supabase em Authentication → Users.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
