# Quirino Store — catálogo streetwear

Catálogo de roupas streetwear **sem checkout**: o cliente navega, escolhe tamanho/cor, monta o carrinho e, ao finalizar, uma mensagem formatada é gerada e o WhatsApp do vendedor é aberto (`wa.me`). Pagamento e entrega são combinados na conversa.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 (CSS-first) · Supabase (Postgres + Auth + Storage) · Zustand (carrinho persistido) · Cloudflare Pages via `@cloudflare/next-on-pages`.

## Funcionalidades

- **Loja**
  - Header fixo com menu de categorias, busca instantânea (`?busca=`) e carrinho com contador
  - Faixa marquee animada (banners cadastrados no admin)
  - Home: hero, Mais Vendidos, Novidades, Promoções, Destaques
  - `/produtos`: grid + filtros por categoria, tamanho, faixa de preço, seleção (promoção / mais vendidos / destaques) e ordenação — tudo via query params
  - `/produtos/[slug]`: galeria com zoom, seleção de tamanho e cor (com disponibilidade cruzada), quantidade limitada ao estoque da variante
  - Carrinho lateral: editar quantidade/remover, nome e telefone do cliente, botão **Finalizar pedido** que abre o WhatsApp com o resumo
- **Admin** (`/admin`, login via Supabase Auth)
  - Produtos: CRUD, upload múltiplo de imagens para o bucket `product-images`, ordenação de fotos, grade de variantes (tamanho + cor + estoque), marcações de promoção/destaque/mais vendido, ativar/desativar
  - Categorias e Banners
- **Funciona sem backend**: se as variáveis do Supabase não estiverem definidas, a loja usa os produtos de exemplo de `src/lib/mock-data.ts` (o admin fica indisponível).

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # edite os valores
npm run dev                  # http://localhost:3000
```

### `.env.local`

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | não* | URL do projeto (Supabase → Project Settings → API). Sem ela, a loja roda em modo mock. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | não* | Chave `anon` pública do projeto. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | sim | Número do vendedor **só com dígitos, com DDI**: `5511999999999`. Sem ele, o WhatsApp abre sem destinatário. |
| `NEXT_PUBLIC_INSTAGRAM` | não | Usuário do Instagram (sem `@`) para o link no menu/rodapé. |

\* As duas variáveis do Supabase precisam estar definidas juntas para o app usar o banco e liberar o admin.

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode `supabase/schema.sql` (tabelas, índices, RLS, bucket `product-images` e dados iniciais de categorias/banners).
3. Opcional: rode `supabase/seed.sql` para carregar os mesmos produtos de exemplo do modo mock.
4. Em **Authentication → Users**, crie o usuário do lojista (e-mail + senha). Não existe tabela própria de usuários: qualquer usuário autenticado é admin.
5. Copie URL e `anon key` para `.env.local`.

Modelo de dados (resumo):

- `categories` — id, nome, slug, ordem
- `products` — id, slug, nome, descricao, categoria_id, marca, preco, preco_promocional, eh_promocao, eh_destaque, eh_mais_vendido, ativo, criado_em
- `product_images` — id, product_id, url, ordem
- `product_variants` — id, product_id, tamanho, cor, **estoque** (o estoque é por variante, não por produto)
- `banners` — id, texto, imagem, ativo, ordem

RLS: leitura pública (produtos inativos só para autenticados), escrita apenas para `authenticated`. O bucket é público para leitura; upload/remoção exigem login.

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção do Next |
| `npm run lint` | ESLint |
| `npm run pages:build` | gera a saída para Cloudflare Pages (`.vercel/output/static`) com `@cloudflare/next-on-pages` |
| `npm run preview` | `pages:build` + `wrangler pages dev` (simula o Worker localmente) |
| `npm run deploy` | `pages:build` + `wrangler pages deploy` |

## Deploy na Cloudflare Pages

1. Conecte o repositório em **Workers & Pages → Create → Pages → Connect to Git**.
2. Configurações de build:
   - **Framework preset:** Next.js
   - **Build command:** `npm run pages:build`
   - **Build output directory:** `.vercel/output/static`
3. Em **Settings → Environment variables**, cadastre as variáveis do `.env.local` (Production e Preview).
4. Em **Settings → Functions → Compatibility flags**, adicione `nodejs_compat` (Production e Preview). Sem isso o Worker falha ao iniciar.
5. Faça o deploy. As rotas da loja rodam no edge (`export const runtime = "edge"` em `src/app/(loja)/layout.tsx`), então o catálogo reflete o banco a cada request, sem rebuild.

> **Windows:** o `pages:build` depende do `vercel build`, que não funciona de forma confiável no Windows (o próprio next-on-pages avisa; na prática ele falha ao mapear os caminhos das funções). Rode em Linux/macOS, WSL ou deixe o build para a Cloudflare/GitHub Actions — o workflow em `.github/workflows/ci.yml` executa `npm run pages:build` em Ubuntu a cada push.

> **Versão do Next:** o projeto está fixado em `next@15.5.x` porque `@cloudflare/next-on-pages` não suporta o Next 16 (peer `<=15.5.2`; usamos o 15.5.25 pelos patches de segurança — o `.npmrc` tem `legacy-peer-deps=true` por isso). Se quiser migrar para o Next 16, o caminho é trocar para `@opennextjs/cloudflare`.

## Estrutura

```
src/
  app/
    (loja)/                 layout da loja (header, marquee, carrinho) + home
      produtos/             grid com filtros
      produtos/[slug]/      página do produto
    admin/login/            login (Supabase Auth)
    admin/(protected)/      produtos, produtos/novo, produtos/[id], categorias, banners
  components/
    layout/   header, marquee, mobile-menu, footer
    catalog/  search, filters, product-card, product-grid
    product/  gallery, zoom, size-selector, color-selector, add-to-cart
    cart/     drawer, cart-hydration
    admin/    admin-guard, admin-shell, product-table, product-form, image-uploader, variant-editor, category-manager, banner-manager
    ui/       button, input, badge, price, quantity-stepper, section-heading
  lib/
    supabase.ts   client + flag isSupabaseConfigured
    products.ts   camada de dados (mock ou Supabase) + filtros
    admin.ts      operações de escrita do painel
    whatsapp.ts   mensagem do pedido + link wa.me
    mock-data.ts  produtos de exemplo
    utils.ts      cn, formatPrice, slugify, máscara de telefone…
  store/cart.ts   Zustand + persist (localStorage)
  types/          Product, Category, ProductVariant, CartItem…
supabase/
  schema.sql      tabelas, RLS, storage
  seed.sql        produtos de exemplo
```

## Design tokens

Definidos em `src/app/globals.css` via `@theme inline` (Tailwind v4, sem `tailwind.config.js`):

- Fundo `#0d0d0d` · superfícies `#1a1a1a` / `#232323` · texto `#edeae1` · muted `#9a9690` · borda `#303030`
- Primário `#2451ff` · promoção `#ff3b1f`
- Display: **Archivo** 700–900 (`font-display`) · corpo: **Inter** 400–600 (`font-sans`), ambas via `next/font/google`
