-- =============================================================================
-- Migração: eyebrow e subtítulo do hero editáveis (site_settings)
-- Para bancos criados antes desta versão: rode este arquivo no SQL Editor.
-- (Bancos novos: supabase/schema.sql já contém tudo isto.) Idempotente.
-- =============================================================================

alter table public.site_settings
  add column if not exists hero_eyebrow text not null
    default 'Drop 09 · 2026 — Coleção nova no ar';

alter table public.site_settings
  add column if not exists hero_subtitulo text not null
    default 'Peças selecionadas, estoque real e pedido direto no WhatsApp. Escolha, monte o carrinho e a gente cuida do resto.';

notify pgrst, 'reload schema';
