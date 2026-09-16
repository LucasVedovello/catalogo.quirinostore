-- =============================================================================
-- Quirino Store — dados de exemplo (opcional)
-- Rode DEPOIS de schema.sql. Mesmos produtos do modo mock (src/lib/mock-data.ts).
-- Idempotente: produtos são identificados pelo slug.
-- =============================================================================

-- Camiseta Skull Hand
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('camiseta-skull-hand-preta', 'Camiseta Skull Hand', 'Camiseta oversized em malha 100% algodão 30.1 penteado, 190 g/m². Estampa em silk de alta densidade no peito. Gola reforçada com ribana e costura dupla. Lavar do avesso.', (select id from public.categories where slug = 'camisetas'), 'Quirino', 129.9, 99.9, true, false, true, true, '2026-08-02T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=80', 0),
    ('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80', 1)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Preto', 3),
  ('M', 'Preto', 8),
  ('G', 'Preto', 6),
  ('GG', 'Preto', 0)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Camiseta Oversized Basic
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('camiseta-oversized-basic', 'Camiseta Oversized Basic', 'Básica oversized com ombro caído e barra reta. Malha pesada 220 g/m² que não deforma. Modelagem streetwear: veste larga, considere seu tamanho normal.', (select id from public.categories where slug = 'camisetas'), 'Quirino', 99.9, null, false, true, true, true, '2026-09-10T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80', 0),
    ('https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=1000&q=80', 1),
    ('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80', 2)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Branco', 4),
  ('P', 'Preto', 5),
  ('M', 'Branco', 10),
  ('M', 'Preto', 9),
  ('G', 'Branco', 7),
  ('G', 'Preto', 0),
  ('GG', 'Branco', 2),
  ('GG', 'Preto', 3)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Camiseta Original Graphic
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('camiseta-original-graphic-off-white', 'Camiseta Original Graphic', 'Estampa frontal inspirada em cultura japonesa, aplicada em silk com toque macio. Malha off-white 100% algodão. Peça de edição limitada.', (select id from public.categories where slug = 'camisetas'), 'Tokyo Dept', 149.9, null, false, false, false, true, '2026-09-12T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('M', 'Off-White', 2),
  ('G', 'Off-White', 4),
  ('GG', 'Off-White', 1)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Camiseta Hotel Minimal
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('camiseta-hotel-minimal', 'Camiseta Hotel Minimal', 'Camiseta branca com bordado minimalista no peito. Corte regular, gola careca. Algodão pima extra macio.', (select id from public.categories where slug = 'camisetas'), 'Quirino', 119.9, 89.9, true, false, false, true, '2026-07-15T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1000&q=80', 0),
    ('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80', 1)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Branco', 5),
  ('M', 'Branco', 5),
  ('G', 'Branco', 5),
  ('GG', 'Branco', 5)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Camiseta Circle Logo
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('camiseta-circle-logo-preta', 'Camiseta Circle Logo', 'Logo circular em silk branco sobre malha preta encorpada. Modelagem regular com leve alongamento. Clássica do guarda-roupa street.', (select id from public.categories where slug = 'camisetas'), '70s Club', 109.9, null, false, false, true, true, '2026-06-20T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Preto', 6),
  ('M', 'Preto', 12),
  ('G', 'Preto', 9),
  ('GG', 'Preto', 4)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Moletom Hoodie Heavy
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('moletom-hoodie-heavy-cinza', 'Moletom Hoodie Heavy', 'Moletom canguru em fleece pesado 400 g/m², felpado por dentro. Capuz duplo com cordão chato, bolso frontal e punhos em ribana. Caimento oversized.', (select id from public.categories where slug = 'moletons'), 'Quirino', 249.9, null, false, true, true, true, '2026-08-20T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Cinza Mescla', 2),
  ('M', 'Cinza Mescla', 6),
  ('G', 'Cinza Mescla', 5),
  ('GG', 'Cinza Mescla', 3)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Moletom Hoodie Pastel
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('moletom-hoodie-rosa-pastel', 'Moletom Hoodie Pastel', 'Hoodie em tom rosa pastel com bordado tonal no peito. Fleece 360 g/m² macio e quente. Modelagem ampla.', (select id from public.categories where slug = 'moletons'), 'Quirino', 259.9, 199.9, true, false, false, true, '2026-07-01T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1565693413579-8ff3fdc1b03b?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Rosa', 3),
  ('M', 'Rosa', 4),
  ('G', 'Rosa', 1)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Crewneck Laranja
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('crewneck-laranja', 'Crewneck Laranja', 'Moletom gola careca em laranja vibrante. Fleece 320 g/m², punhos e barra em ribana canelada. Combina com denim escuro.', (select id from public.categories where slug = 'moletons'), 'Sunset Co.', 219.9, null, false, false, false, true, '2026-09-08T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Laranja', 5),
  ('M', 'Laranja', 5),
  ('G', 'Laranja', 5),
  ('GG', 'Laranja', 5)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Crewneck Essential
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('crewneck-essential-branco', 'Crewneck Essential', 'Crewneck branco básico premium. Fleece 100% algodão com acabamento peletizado. Corte reto, sem estampa.', (select id from public.categories where slug = 'moletons'), 'Quirino', 199.9, null, false, false, false, true, '2026-05-11T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Branco', 0),
  ('M', 'Branco', 3),
  ('G', 'Branco', 2),
  ('GG', 'Branco', 0)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Calça Jeans Straight Dark
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('calca-jeans-straight-dark', 'Calça Jeans Straight Dark', 'Jeans straight em lavagem escura, 12 oz, 100% algodão sem elastano. Cintura média, cinco bolsos, ferragens em metal envelhecido.', (select id from public.categories where slug = 'calcas'), 'Quirino Denim', 289.9, null, false, false, true, true, '2026-08-10T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=80', 0),
    ('https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=1000&q=80', 1)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('38', 'Azul Escuro', 2),
  ('40', 'Azul Escuro', 5),
  ('42', 'Azul Escuro', 6),
  ('44', 'Azul Escuro', 3),
  ('46', 'Azul Escuro', 1)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Calça Jeans Light Wash
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('calca-jeans-light-wash', 'Calça Jeans Light Wash', 'Lavagem clara com leve desbotamento natural. Modelagem slim straight, com 2% de elastano para conforto.', (select id from public.categories where slug = 'calcas'), 'Quirino Denim', 279.9, 229.9, true, false, false, true, '2026-06-05T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('38', 'Azul Claro', 5),
  ('40', 'Azul Claro', 5),
  ('42', 'Azul Claro', 5),
  ('44', 'Azul Claro', 5),
  ('46', 'Azul Claro', 5)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Calça Cargo Utility
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('calca-cargo-utility-rose', 'Calça Cargo Utility', 'Cargo em sarja leve com bolsos laterais amplos e barra ajustável por cordão. Cintura elástica com cadarço. Tom rosé exclusivo do drop.', (select id from public.categories where slug = 'calcas'), 'Quirino', 239.9, null, false, true, false, true, '2026-09-14T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Rosé', 4),
  ('M', 'Rosé', 4),
  ('G', 'Rosé', 4),
  ('GG', 'Rosé', 2)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Calça Wide Leg
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('calca-wide-leg-preta', 'Calça Wide Leg', 'Wide leg em sarja pesada preta. Cintura alta, pences frontais e caimento fluido. Peça-chave para looks monocromáticos.', (select id from public.categories where slug = 'calcas'), 'Quirino', 249.9, null, false, false, false, true, '2026-04-22T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('38', 'Preto', 5),
  ('40', 'Preto', 5),
  ('42', 'Preto', 5),
  ('44', 'Preto', 5),
  ('46', 'Preto', 5)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Jaqueta Biker
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('jaqueta-biker-couro-sintetico', 'Jaqueta Biker', 'Jaqueta biker em couro sintético premium com zíperes assimétricos e forro acetinado. Ombros estruturados, cinto na barra.', (select id from public.categories where slug = 'jaquetas'), 'Quirino', 399.9, null, false, true, false, true, '2026-08-28T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Preto', 1),
  ('M', 'Preto', 3),
  ('G', 'Preto', 2),
  ('GG', 'Preto', 1)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Jaqueta Bomber
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('jaqueta-bomber-rose', 'Jaqueta Bomber', 'Bomber clássica em nylon acetinado com ribana na gola, punhos e barra. Bolso na manga e forro leve. Cor rosé terroso.', (select id from public.categories where slug = 'jaquetas'), 'Sunset Co.', 349.9, 279.9, true, false, false, true, '2026-05-30T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('M', 'Rosé', 5),
  ('G', 'Rosé', 5),
  ('GG', 'Rosé', 5)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Jaqueta Jeans Trucker
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('jaqueta-jeans-trucker', 'Jaqueta Jeans Trucker', 'Trucker jacket em denim índigo 13 oz com gola em corduroy caramelo. Bolsos frontais com lapela, botões metálicos.', (select id from public.categories where slug = 'jaquetas'), 'Quirino Denim', 329.9, null, false, false, true, true, '2026-07-22T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('P', 'Índigo', 2),
  ('M', 'Índigo', 5),
  ('G', 'Índigo', 4),
  ('GG', 'Índigo', 2)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Boné Dad Hat Denim
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('bone-dad-hat-denim', 'Boné Dad Hat Denim', 'Dad hat em denim lavado com bordado de palmeira. Aba curva, fecho de fivela metálica. Tamanho ajustável.', (select id from public.categories where slug = 'bones'), 'Quirino', 89.9, null, false, false, false, true, '2026-09-01T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('Único', 'Azul', 12)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Boné Trucker
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('bone-trucker', 'Boné Trucker', 'Trucker com tela traseira respirável e frente em espuma. Aba levemente curva, fecho snapback.', (select id from public.categories where slug = 'bones'), 'Quirino', 79.9, 59.9, true, false, true, true, '2026-06-12T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('Único', 'Branco', 8),
  ('Único', 'Preto', 5)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Tênis Runner Red
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('tenis-runner-red', 'Tênis Runner Red', 'Runner leve com cabedal em malha knit respirável e entressola em espuma de alto retorno. Solado em borracha com tração multidirecional.', (select id from public.categories where slug = 'tenis'), 'Runner Lab', 499.9, null, false, true, false, true, '2026-08-15T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('38', 'Vermelho', 1),
  ('39', 'Vermelho', 2),
  ('40', 'Vermelho', 3),
  ('41', 'Vermelho', 3),
  ('42', 'Vermelho', 2),
  ('43', 'Vermelho', 0)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Tênis High Retro
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('tenis-high-retro-red-black', 'Tênis High Retro', 'Cano alto retrô em couro legítimo com colarinho acolchoado. Combinação clássica vermelho/preto/branco. Solado cupsole em borracha.', (select id from public.categories where slug = 'tenis'), 'Court Kings', 799.9, 699.9, true, false, true, true, '2026-07-30T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80', 0),
    ('https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1000&q=80', 1)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('38', 'Vermelho/Preto', 0),
  ('39', 'Vermelho/Preto', 1),
  ('40', 'Vermelho/Preto', 2),
  ('41', 'Vermelho/Preto', 2),
  ('42', 'Vermelho/Preto', 1),
  ('43', 'Vermelho/Preto', 1)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Tênis Air Low
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('tenis-air-low-white-orange', 'Tênis Air Low', 'Cano baixo com unidade de amortecimento visível no calcanhar. Cabedal em mesh e camurça sintética. Branco com detalhes laranja.', (select id from public.categories where slug = 'tenis'), 'Runner Lab', 599.9, null, false, false, false, true, '2026-06-25T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('38', 'Branco/Laranja', 2),
  ('39', 'Branco/Laranja', 2),
  ('40', 'Branco/Laranja', 4),
  ('41', 'Branco/Laranja', 3),
  ('42', 'Branco/Laranja', 2),
  ('43', 'Branco/Laranja', 1)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;

-- Tênis Court Branco
with prod as (
  insert into public.products (slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em)
  values ('tenis-court-branco', 'Tênis Court Branco', 'Court clássico em couro branco com solado de borracha vulcanizada. Minimalista, versátil e fácil de limpar.', (select id from public.categories where slug = 'tenis'), 'Court Kings', 349.9, null, false, false, false, true, '2026-09-13T12:00:00Z')
  on conflict (slug) do update set nome = excluded.nome
  returning id
),
imgs as (
  insert into public.product_images (product_id, url, ordem)
  select prod.id, v.url, v.ordem from prod, (values
    ('https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80', 0)
  ) as v(url, ordem)
  where not exists (select 1 from public.product_images pi where pi.product_id = prod.id)
)
insert into public.product_variants (product_id, tamanho, cor, estoque)
select prod.id, v.tamanho, v.cor, v.estoque from prod, (values
  ('38', 'Branco', 5),
  ('39', 'Branco', 5),
  ('40', 'Branco', 5),
  ('41', 'Branco', 5),
  ('42', 'Branco', 5),
  ('43', 'Branco', 5)
) as v(tamanho, cor, estoque)
on conflict (product_id, tamanho, cor) do update set estoque = excluded.estoque;
