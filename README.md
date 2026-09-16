# Quirino Store — catálogo streetwear

Catálogo de roupas streetwear **sem checkout**: o cliente navega, escolhe tamanho/cor, monta o carrinho e, ao finalizar, uma mensagem formatada é gerada e o WhatsApp do vendedor é aberto (`wa.me`). Pagamento e entrega são combinados na conversa.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 (CSS-first) · Supabase (Postgres + Auth + Storage) · Zustand (carrinho persistido) · Cloudflare Workers via `@opennextjs/cloudflare`.

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
| `npm run build:cloudflare` | `next build` + empacota o Worker com `@opennextjs/cloudflare` (gera `.open-next/worker.js` e `.open-next/assets`) |
| `npm run preview:cloudflare` | `build:cloudflare` + `wrangler dev` (roda o Worker localmente em http://localhost:8787) |
| `npm run deploy:cloudflare` | `build:cloudflare` + `wrangler deploy` (publica na sua conta Cloudflare) |

## Deploy na Cloudflare (Workers)

O projeto usa o adaptador oficial [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). A configuração fica em:

- `open-next.config.ts` — `defineCloudflareConfig({})`
- `wrangler.jsonc` — `main: .open-next/worker.js`, `assets.directory: .open-next/assets`, `compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"]`

### Pelo painel (Git integrado — recomendado)

1. **Workers & Pages → Create → Workers → Import a repository** e selecione este repositório.
2. Configurações de build:
   - **Build command:** `npm run build:cloudflare`
   - **Deploy command:** `npx wrangler deploy`
   - **Root directory:** `/` (padrão)
3. Em **Settings → Variables and Secrets**, cadastre as variáveis do `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_INSTAGRAM`) **também como variáveis de build** — elas são `NEXT_PUBLIC_*`, ou seja, embutidas no bundle durante o `next build`. Se só existirem em runtime, a loja sobe em modo mock.
4. Cada push em `main` faz build + deploy.

> Se o deploy falhar com o Worker "vazio" ou sem assets, confira se o **Build command** está preenchido: rodar só `npx wrangler deploy` sem o `npm run build:cloudflare` antes não gera o `.open-next/`.

### Pela linha de comando

```bash
npx wrangler login          # só na primeira vez — abre o navegador
npm run deploy:cloudflare   # build + publish
```

Para testar o Worker localmente antes de publicar: `npm run preview:cloudflare`.

> **Observações**
> - As rotas da loja usam `export const dynamic = "force-dynamic"` (`src/app/(loja)/layout.tsx`), então o catálogo reflete o banco a cada request, sem rebuild. O OpenNext não suporta `runtime = "edge"` — todas as rotas rodam no runtime Node do Worker.
> - O projeto usa `next@15.5.x`; o `@opennextjs/cloudflare` também suporta o Next 16 (`>=16.3.3`) caso queira atualizar.
> - O workflow `.github/workflows/ci.yml` roda lint + `build:cloudflare` + `wrangler deploy --dry-run` a cada push, como verificação independente do painel.

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
open-next.config.ts   adaptador OpenNext (Cloudflare)
wrangler.jsonc        configuração do Worker
```

## Design tokens

Definidos em `src/app/globals.css` via `@theme inline` (Tailwind v4, sem `tailwind.config.js`):

- Fundo `#0d0d0d` · superfícies `#1a1a1a` / `#232323` · texto `#edeae1` · muted `#9a9690` · borda `#303030`
- Primário `#2451ff` · promoção `#ff3b1f`
- Display: **Archivo** 700–900 (`font-display`) · corpo: **Inter** 400–600 (`font-sans`), ambas via `next/font/google`
