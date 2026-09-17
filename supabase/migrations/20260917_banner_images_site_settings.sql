-- =============================================================================
-- Migração: imagens do banner da home + configurações do site (texto do hero)
-- Para bancos criados antes desta versão: rode este arquivo no SQL Editor.
-- (Bancos novos: supabase/schema.sql já contém tudo isto.) Idempotente.
-- =============================================================================

-- Imagens do banner/hero da home (carrossel). Arquivos no bucket product-images, pasta "banner/".
create table if not exists public.banner_images (
  id         uuid primary key default gen_random_uuid(),
  url        text not null,
  titulo     text,
  link       text,
  ativo      boolean not null default true,
  ordem      integer not null default 0,
  criado_em  timestamptz not null default now()
);

-- Configurações gerais do site: linha única (id = 1), uma coluna por configuração.
create table if not exists public.site_settings (
  id             integer primary key default 1 check (id = 1),
  hero_titulo    text not null default 'Inspirado pelo medo de ser comum',
  atualizado_em  timestamptz not null default now()
);

create index if not exists banner_images_ativo_idx on public.banner_images (ativo, ordem);

alter table public.banner_images enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "banner_images: leitura publica" on public.banner_images;
create policy "banner_images: leitura publica" on public.banner_images
  for select using (true);

drop policy if exists "banner_images: escrita autenticada" on public.banner_images;
create policy "banner_images: escrita autenticada" on public.banner_images
  for all to authenticated using (true) with check (true);

drop policy if exists "site_settings: leitura publica" on public.site_settings;
create policy "site_settings: leitura publica" on public.site_settings
  for select using (true);

drop policy if exists "site_settings: escrita autenticada" on public.site_settings;
create policy "site_settings: escrita autenticada" on public.site_settings
  for all to authenticated using (true) with check (true);

-- Linha única de configurações (os defaults da tabela preenchem os valores iniciais).
insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

-- Faz o PostgREST recarregar o schema (novas tabelas ficam visíveis pela API na hora).
notify pgrst, 'reload schema';
