export interface Category {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  ordem: number;
}

/** Estoque é controlado por variante (tamanho + cor), nunca pelo produto. */
export interface ProductVariant {
  id: string;
  product_id: string;
  tamanho: string;
  cor: string;
  estoque: number;
}

export interface Product {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  categoria_id: string | null;
  marca: string | null;
  preco: number;
  preco_promocional: number | null;
  eh_promocao: boolean;
  eh_destaque: boolean;
  eh_mais_vendido: boolean;
  ativo: boolean;
  criado_em: string;
  categoria: Category | null;
  imagens: ProductImage[];
  variantes: ProductVariant[];
}

export interface Banner {
  id: string;
  texto: string | null;
  imagem: string | null;
  ativo: boolean;
  ordem: number;
}

/** Imagem do carrossel do hero da home (tabela banner_images). */
export interface BannerImage {
  id: string;
  url: string;
  /** Texto alternativo/legenda (opcional). */
  titulo: string | null;
  /** Destino ao clicar na imagem (opcional): rota interna ou URL externa. */
  link: string | null;
  ativo: boolean;
  ordem: number;
  criado_em: string;
}

/** Configurações gerais do site — linha única na tabela site_settings. */
export interface SiteSettings {
  /** Frase pequena acima do título do hero (ex.: "Drop 09 · 2026 — Coleção nova no ar"). Vazio = não aparece. */
  hero_eyebrow: string;
  /** Título do hero da home. Quebras de linha são respeitadas; sem elas, o texto é equilibrado em 2–3 linhas. */
  hero_titulo: string;
  /** Parágrafo abaixo do título do hero. Vazio = não aparece. */
  hero_subtitulo: string;
}

export interface CartItem {
  /** `${productId}:${variantId}` */
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  nome: string;
  imagem: string | null;
  tamanho: string;
  cor: string;
  /** Preço unitário efetivo (já considerando promoção) no momento da adição. */
  preco: number;
  quantidade: number;
  /** Estoque da variante no momento da adição — usado para limitar a quantidade. */
  estoque: number;
}

export type ProductSort = "recentes" | "menor-preco" | "maior-preco" | "nome";

export type ProductTag = "promocao" | "mais-vendidos" | "destaques";

export interface ProductFilters {
  busca?: string;
  /** slug da categoria */
  categoria?: string;
  tamanho?: string;
  precoMin?: number;
  precoMax?: number;
  ordenar?: ProductSort;
  tag?: ProductTag;
}

export interface HomeSections {
  maisVendidos: Product[];
  novidades: Product[];
  promocoes: Product[];
  destaques: Product[];
}
