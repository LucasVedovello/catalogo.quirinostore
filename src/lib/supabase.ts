import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true quando as variáveis de ambiente do Supabase estão definidas. Sem elas, o app usa mock-data. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Bucket público do Supabase Storage usado para fotos dos produtos. */
export const STORAGE_BUCKET = "product-images";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local.",
    );
  }
  if (!client) {
    const isBrowser = typeof window !== "undefined";
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: isBrowser,
      },
    });
  }
  return client;
}

/** Extrai o caminho dentro do bucket a partir de uma URL pública do Storage. */
export function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}
