-- =============================================================================
-- Quirino Store — schema do catálogo
-- Rode este arquivo inteiro no SQL Editor do Supabase (Dashboard → SQL Editor).
-- Idempotente: pode rodar de novo sem quebrar.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------

create table if not exists public.categories (
  id     uuid primary key default gen_random_uuid(),
  nome   text not null,
  slug   text not null unique,
  ordem  integer not null default 0
);

create table if not exists public.products (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  nome               text not null,
  descricao          text,
  categoria_id       uuid references public.categories(id) on delete set null,
  marca              text,
  preco              numeric(10,2) not null check (preco >= 0),
  preco_promocional  numeric(10,2) check (preco_promocional is null or preco_promocional >= 0),
  eh_promocao        boolean not null default false,
  eh_destaque        boolean not null default false,
  eh_mais_vendido    boolean not null default false,
  ativo              boolean not null default true,
  criado_em          timestamptz not null default now()
);

create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  ordem       integer not null default 0
);

-- Estoque é POR VARIANTE (tamanho + cor), nunca por produto.
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  tamanho     text not null,
  cor         text not null,
  estoque     integer not null default 0 check (estoque >= 0),
  unique (product_id, tamanho, cor)
);

create table if not exists public.banners (
  id      uuid primary key default gen_random_uuid(),
  texto   text,
  imagem  text,
  ativo   boolean not null default true,
  ordem   integer not null default 0,
  check (texto is not null or imagem is not null)
);

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
  id              integer primary key default 1 check (id = 1),
  hero_titulo     text not null default 'Inspirado pelo medo de ser comum',
  hero_eyebrow    text not null default 'Drop 09 · 2026 — Coleção nova no ar',
  hero_subtitulo  text not null default 'Peças selecionadas, estoque real e pedido direto no WhatsApp. Escolha, monte o carrinho e a gente cuida do resto.',
  atualizado_em   timestamptz not null default now()
);
-- Colunas adicionadas depois da criação da tabela (bancos antigos): o "create if not exists" acima não as inclui.
alter table public.site_settings
  add column if not exists hero_eyebrow text not null default 'Drop 09 · 2026 — Coleção nova no ar';
alter table public.site_settings
  add column if not exists hero_subtitulo text not null default 'Peças selecionadas, estoque real e pedido direto no WhatsApp. Escolha, monte o carrinho e a gente cuida do resto.';

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------

create index if not exists products_categoria_idx   on public.products (categoria_id);
create index if not exists products_ativo_idx       on public.products (ativo, criado_em desc);
create index if not exists products_flags_idx       on public.products (eh_promocao, eh_destaque, eh_mais_vendido) where ativo;
create index if not exists product_images_prod_idx  on public.product_images (product_id, ordem);
create index if not exists product_variants_prod_idx on public.product_variants (product_id);
create index if not exists categories_ordem_idx     on public.categories (ordem);
create index if not exists banners_ativo_idx        on public.banners (ativo, ordem);
create index if not exists banner_images_ativo_idx  on public.banner_images (ativo, ordem);

-- -----------------------------------------------------------------------------
-- RLS: leitura pública, escrita só para usuários autenticados (Supabase Auth).
-- O admin é qualquer usuário criado em Authentication → Users — não há tabela própria.
-- -----------------------------------------------------------------------------

alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.product_variants enable row level security;
alter table public.banners          enable row level security;
alter table public.banner_images    enable row level security;
alter table public.site_settings    enable row level security;

-- categories
drop policy if exists "categories: leitura publica" on public.categories;
create policy "categories: leitura publica" on public.categories
  for select using (true);

drop policy if exists "categories: escrita autenticada" on public.categories;
create policy "categories: escrita autenticada" on public.categories
  for all to authenticated using (true) with check (true);

-- products: anônimos só veem produtos ativos; autenticados veem tudo (admin)
drop policy if exists "products: leitura publica" on public.products;
create policy "products: leitura publica" on public.products
  for select using (ativo = true or auth.role() = 'authenticated');

drop policy if exists "products: escrita autenticada" on public.products;
create policy "products: escrita autenticada" on public.products
  for all to authenticated using (true) with check (true);

-- product_images
drop policy if exists "product_images: leitura publica" on public.product_images;
create policy "product_images: leitura publica" on public.product_images
  for select using (true);

drop policy if exists "product_images: escrita autenticada" on public.product_images;
create policy "product_images: escrita autenticada" on public.product_images
  for all to authenticated using (true) with check (true);

-- product_variants
drop policy if exists "product_variants: leitura publica" on public.product_variants;
create policy "product_variants: leitura publica" on public.product_variants
  for select using (true);

drop policy if exists "product_variants: escrita autenticada" on public.product_variants;
create policy "product_variants: escrita autenticada" on public.product_variants
  for all to authenticated using (true) with check (true);

-- banners
drop policy if exists "banners: leitura publica" on public.banners;
create policy "banners: leitura publica" on public.banners
  for select using (true);

drop policy if exists "banners: escrita autenticada" on public.banners;
create policy "banners: escrita autenticada" on public.banners
  for all to authenticated using (true) with check (true);

-- banner_images
drop policy if exists "banner_images: leitura publica" on public.banner_images;
create policy "banner_images: leitura publica" on public.banner_images
  for select using (true);

drop policy if exists "banner_images: escrita autenticada" on public.banner_images;
create policy "banner_images: escrita autenticada" on public.banner_images
  for all to authenticated using (true) with check (true);

-- site_settings
drop policy if exists "site_settings: leitura publica" on public.site_settings;
create policy "site_settings: leitura publica" on public.site_settings
  for select using (true);

drop policy if exists "site_settings: escrita autenticada" on public.site_settings;
create policy "site_settings: escrita autenticada" on public.site_settings
  for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Storage: bucket público "product-images"
-- (leitura pública; upload/alteração/remoção só autenticado)
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product-images: leitura publica" on storage.objects;
create policy "product-images: leitura publica" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product-images: upload autenticado" on storage.objects;
create policy "product-images: upload autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "product-images: update autenticado" on storage.objects;
create policy "product-images: update autenticado" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

drop policy if exists "product-images: delete autenticado" on storage.objects;
create policy "product-images: delete autenticado" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');

-- -----------------------------------------------------------------------------
-- Dados iniciais (categorias, banners e configurações). Produtos de exemplo: ver seed.sql.
-- -----------------------------------------------------------------------------

-- Linha única de configurações (os defaults da tabela preenchem os valores iniciais).
insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

insert into public.categories (nome, slug, ordem) values
  ('Camisetas', 'camisetas', 1),
  ('Moletons',  'moletons',  2),
  ('Calças',    'calcas',    3),
  ('Jaquetas',  'jaquetas',  4),
  ('Bonés',     'bones',     5),
  ('Tênis',     'tenis',     6)
on conflict (slug) do nothing;

insert into public.banners (texto, ativo, ordem)
select * from (values
  ('Frete grátis acima de R$ 299', true, 1),
  ('Pedido direto no WhatsApp',    true, 2),
  ('Até 30% OFF em peças selecionadas', true, 3),
  ('Novo drop toda sexta',         true, 4)
) as v(texto, ativo, ordem)
where not exists (select 1 from public.banners);
