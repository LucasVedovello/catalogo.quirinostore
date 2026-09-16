"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { SupabaseNotice } from "./supabase-notice";

interface AdminSessionValue {
  session: Session;
  signOut: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function useAdminSession(): AdminSessionValue {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession precisa estar dentro de <AdminGuard>");
  return ctx;
}

/** Só renderiza os filhos com uma sessão válida do Supabase Auth; senão manda para /admin/login. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
      if (!data.session) router.replace("/admin/login");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) router.replace("/admin/login");
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <SupabaseNotice />
      </div>
    );
  }

  if (!checked || !session) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Verificando acesso…
        </div>
      </div>
    );
  }

  const signOut = async () => {
    await getSupabase().auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <AdminSessionContext.Provider value={{ session, signOut }}>{children}</AdminSessionContext.Provider>
  );
}
