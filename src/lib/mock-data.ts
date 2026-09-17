import type {
  Banner,
  BannerImage,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  SiteSettings,
} from "@/types";

/**
 * Dados de exemplo usados quando o Supabase não está configurado.
 * Mesmo formato que a camada de dados devolve a partir do banco.
 */

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;

export const mockCategories: Category[] = [
  { id: "cat-camisetas", nome: "Camisetas", slug: "camisetas", ordem: 1 },
  { id: "cat-moletons", nome: "Moletons", slug: "moletons", ordem: 2 },
  { id: "cat-calcas", nome: "Calças", slug: "calcas", ordem: 3 },
  { id: "cat-jaquetas", nome: "Jaquetas", slug: "jaquetas", ordem: 4 },
  { id: "cat-bones", nome: "Bonés", slug: "bones", ordem: 5 },
  { id: "cat-tenis", nome: "Tênis", slug: "tenis", ordem: 6 },
];

export const mockBanners: Banner[] = [
  { id: "ban-1", texto: "Frete grátis acima de R$ 299", imagem: null, ativo: true, ordem: 1 },
  { id: "ban-2", texto: "Pedido direto no WhatsApp", imagem: null, ativo: true, ordem: 2 },
  { id: "ban-3", texto: "Até 30% OFF em peças selecionadas", imagem: null, ativo: true, ordem: 3 },
  { id: "ban-4", texto: "Novo drop toda sexta", imagem: null, ativo: true, ordem: 4 },
];

export const mockBannerImages: BannerImage[] = [
  {
    id: "hero-1",
    url: img("1523381210434-271e8be1f52b"),
    titulo: "Novo drop",
    link: "/produtos?ordenar=recentes",
    ativo: true,
    ordem: 1,
    criado_em: "2026-09-01T12:00:00Z",
  },
  {
    id: "hero-2",
    url: img("1552346154-21d32810aba3"),
    titulo: "Promoções",
    link: "/produtos?tag=promocao",
    ativo: true,
    ordem: 2,
    criado_em: "2026-09-01T12:00:00Z",
  },
  {
    id: "hero-3",
    url: img("1591047139829-d91aecb6caea"),
    titulo: "Mais vendidos",
    link: "/produtos?tag=mais-vendidos",
    ativo: true,
    ordem: 3,
    criado_em: "2026-09-01T12:00:00Z",
  },
];

/** Valores padrão das configurações — também usados como fallback se a tabela estiver vazia. */
export const defaultSiteSettings: SiteSettings = {
  hero_titulo: "Inspirado pelo medo de ser comum",
};

const catById = Object.fromEntries(mockCategories.map((c) => [c.id, c]));

interface MockProductInput {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  categoria_id: string;
  marca: string;
  preco: number;
  preco_promocional?: number;
  eh_promocao?: boolean;
  eh_destaque?: boolean;
  eh_mais_vendido?: boolean;
  ativo?: boolean;
  criado_em: string;
  imagens: string[];
  tamanhos: string[];
  cores: string[];
  /** estoque por combinação; padrão 5. Chave "TAM|COR". */
  estoque?: Record<string, number>;
}

function build(input: MockProductInput): Product {
  const imagens: ProductImage[] = input.imagens.map((url, i) => ({
    id: `${input.id}-img-${i + 1}`,
    product_id: input.id,
    url,
    ordem: i,
  }));

  const variantes: ProductVariant[] = [];
  let n = 0;
  for (const tamanho of input.tamanhos) {
    for (const cor of input.cores) {
      n += 1;
      const key = `${tamanho}|${cor}`;
      variantes.push({
        id: `${input.id}-v${n}`,
        product_id: input.id,
        tamanho,
        cor,
        estoque: input.estoque?.[key] ?? 5,
      });
    }
  }

  return {
    id: input.id,
    slug: input.slug,
    nome: input.nome,
    descricao: input.descricao,
    categoria_id: input.categoria_id,
    marca: input.marca,
    preco: input.preco,
    preco_promocional: input.preco_promocional ?? null,
    eh_promocao: input.eh_promocao ?? false,
    eh_destaque: input.eh_destaque ?? false,
    eh_mais_vendido: input.eh_mais_vendido ?? false,
    ativo: input.ativo ?? true,
    criado_em: input.criado_em,
    categoria: catById[input.categoria_id] ?? null,
    imagens,
    variantes,
  };
}

const ROUPA = ["P", "M", "G", "GG"];
const CALCA = ["38", "40", "42", "44", "46"];
const TENIS = ["38", "39", "40", "41", "42", "43"];
const UNICO = ["Único"];

export const mockProducts: Product[] = [
  build({
    id: "p-01",
    slug: "camiseta-skull-hand-preta",
    nome: "Camiseta Skull Hand",
    descricao:
      "Camiseta oversized em malha 100% algodão 30.1 penteado, 190 g/m². Estampa em silk de alta densidade no peito. Gola reforçada com ribana e costura dupla. Lavar do avesso.",
    categoria_id: "cat-camisetas",
    marca: "Quirino",
    preco: 129.9,
    preco_promocional: 99.9,
    eh_promocao: true,
    eh_mais_vendido: true,
    criado_em: "2026-08-02T12:00:00Z",
    imagens: [img("1503341504253-dff4815485f1"), img("1583743814966-8936f5b7be1a")],
    tamanhos: ROUPA,
    cores: ["Preto"],
    estoque: { "P|Preto": 3, "M|Preto": 8, "G|Preto": 6, "GG|Preto": 0 },
  }),
  build({
    id: "p-02",
    slug: "camiseta-oversized-basic",
    nome: "Camiseta Oversized Basic",
    descricao:
      "Básica oversized com ombro caído e barra reta. Malha pesada 220 g/m² que não deforma. Modelagem streetwear: veste larga, considere seu tamanho normal.",
    categoria_id: "cat-camisetas",
    marca: "Quirino",
    preco: 99.9,
    eh_destaque: true,
    eh_mais_vendido: true,
    criado_em: "2026-09-10T12:00:00Z",
    imagens: [
      img("1521572163474-6864f9cf17ab"),
      img("1622445275463-afa2ab738c34"),
      img("1583743814966-8936f5b7be1a"),
    ],
    tamanhos: ROUPA,
    cores: ["Branco", "Preto"],
    estoque: {
      "P|Branco": 4,
      "M|Branco": 10,
      "G|Branco": 7,
      "GG|Branco": 2,
      "P|Preto": 5,
      "M|Preto": 9,
      "G|Preto": 0,
      "GG|Preto": 3,
    },
  }),
  build({
    id: "p-03",
    slug: "camiseta-original-graphic-off-white",
    nome: "Camiseta Original Graphic",
    descricao:
      "Estampa frontal inspirada em cultura japonesa, aplicada em silk com toque macio. Malha off-white 100% algodão. Peça de edição limitada.",
    categoria_id: "cat-camisetas",
    marca: "Tokyo Dept",
    preco: 149.9,
    criado_em: "2026-09-12T12:00:00Z",
    imagens: [img("1576566588028-4147f3842f27")],
    tamanhos: ["M", "G", "GG"],
    cores: ["Off-White"],
    estoque: { "M|Off-White": 2, "G|Off-White": 4, "GG|Off-White": 1 },
  }),
  build({
    id: "p-04",
    slug: "camiseta-hotel-minimal",
    nome: "Camiseta Hotel Minimal",
    descricao:
      "Camiseta branca com bordado minimalista no peito. Corte regular, gola careca. Algodão pima extra macio.",
    categoria_id: "cat-camisetas",
    marca: "Quirino",
    preco: 119.9,
    preco_promocional: 89.9,
    eh_promocao: true,
    criado_em: "2026-07-15T12:00:00Z",
    imagens: [img("1529374255404-311a2a4f1fd9"), img("1523381210434-271e8be1f52b")],
    tamanhos: ROUPA,
    cores: ["Branco"],
  }),
  build({
    id: "p-05",
    slug: "camiseta-circle-logo-preta",
    nome: "Camiseta Circle Logo",
    descricao:
      "Logo circular em silk branco sobre malha preta encorpada. Modelagem regular com leve alongamento. Clássica do guarda-roupa street.",
    categoria_id: "cat-camisetas",
    marca: "70s Club",
    preco: 109.9,
    eh_mais_vendido: true,
    criado_em: "2026-06-20T12:00:00Z",
    imagens: [img("1618354691373-d851c5c3a990")],
    tamanhos: ROUPA,
    cores: ["Preto"],
    estoque: { "P|Preto": 6, "M|Preto": 12, "G|Preto": 9, "GG|Preto": 4 },
  }),

  build({
    id: "p-06",
    slug: "moletom-hoodie-heavy-cinza",
    nome: "Moletom Hoodie Heavy",
    descricao:
      "Moletom canguru em fleece pesado 400 g/m², felpado por dentro. Capuz duplo com cordão chato, bolso frontal e punhos em ribana. Caimento oversized.",
    categoria_id: "cat-moletons",
    marca: "Quirino",
    preco: 249.9,
    eh_destaque: true,
    eh_mais_vendido: true,
    criado_em: "2026-08-20T12:00:00Z",
    imagens: [img("1556821840-3a63f95609a7")],
    tamanhos: ROUPA,
    cores: ["Cinza Mescla"],
    estoque: { "P|Cinza Mescla": 2, "M|Cinza Mescla": 6, "G|Cinza Mescla": 5, "GG|Cinza Mescla": 3 },
  }),
  build({
    id: "p-07",
    slug: "moletom-hoodie-rosa-pastel",
    nome: "Moletom Hoodie Pastel",
    descricao:
      "Hoodie em tom rosa pastel com bordado tonal no peito. Fleece 360 g/m² macio e quente. Modelagem ampla.",
    categoria_id: "cat-moletons",
    marca: "Quirino",
    preco: 259.9,
    preco_promocional: 199.9,
    eh_promocao: true,
    criado_em: "2026-07-01T12:00:00Z",
    imagens: [img("1565693413579-8ff3fdc1b03b")],
    tamanhos: ["P", "M", "G"],
    cores: ["Rosa"],
    estoque: { "P|Rosa": 3, "M|Rosa": 4, "G|Rosa": 1 },
  }),
  build({
    id: "p-08",
    slug: "crewneck-laranja",
    nome: "Crewneck Laranja",
    descricao:
      "Moletom gola careca em laranja vibrante. Fleece 320 g/m², punhos e barra em ribana canelada. Combina com denim escuro.",
    categoria_id: "cat-moletons",
    marca: "Sunset Co.",
    preco: 219.9,
    criado_em: "2026-09-08T12:00:00Z",
    imagens: [img("1578587018452-892bacefd3f2")],
    tamanhos: ROUPA,
    cores: ["Laranja"],
  }),
  build({
    id: "p-09",
    slug: "crewneck-essential-branco",
    nome: "Crewneck Essential",
    descricao:
      "Crewneck branco básico premium. Fleece 100% algodão com acabamento peletizado. Corte reto, sem estampa.",
    categoria_id: "cat-moletons",
    marca: "Quirino",
    preco: 199.9,
    criado_em: "2026-05-11T12:00:00Z",
    imagens: [img("1620799140408-edc6dcb6d633")],
    tamanhos: ROUPA,
    cores: ["Branco"],
    estoque: { "P|Branco": 0, "M|Branco": 3, "G|Branco": 2, "GG|Branco": 0 },
  }),

  build({
    id: "p-10",
    slug: "calca-jeans-straight-dark",
    nome: "Calça Jeans Straight Dark",
    descricao:
      "Jeans straight em lavagem escura, 12 oz, 100% algodão sem elastano. Cintura média, cinco bolsos, ferragens em metal envelhecido.",
    categoria_id: "cat-calcas",
    marca: "Quirino Denim",
    preco: 289.9,
    eh_mais_vendido: true,
    criado_em: "2026-08-10T12:00:00Z",
    imagens: [img("1542272604-787c3835535d"), img("1560243563-062bfc001d68")],
    tamanhos: CALCA,
    cores: ["Azul Escuro"],
    estoque: {
      "38|Azul Escuro": 2,
      "40|Azul Escuro": 5,
      "42|Azul Escuro": 6,
      "44|Azul Escuro": 3,
      "46|Azul Escuro": 1,
    },
  }),
  build({
    id: "p-11",
    slug: "calca-jeans-light-wash",
    nome: "Calça Jeans Light Wash",
    descricao:
      "Lavagem clara com leve desbotamento natural. Modelagem slim straight, com 2% de elastano para conforto.",
    categoria_id: "cat-calcas",
    marca: "Quirino Denim",
    preco: 279.9,
    preco_promocional: 229.9,
    eh_promocao: true,
    criado_em: "2026-06-05T12:00:00Z",
    imagens: [img("1584370848010-d7fe6bc767ec")],
    tamanhos: CALCA,
    cores: ["Azul Claro"],
  }),
  build({
    id: "p-12",
    slug: "calca-cargo-utility-rose",
    nome: "Calça Cargo Utility",
    descricao:
      "Cargo em sarja leve com bolsos laterais amplos e barra ajustável por cordão. Cintura elástica com cadarço. Tom rosé exclusivo do drop.",
    categoria_id: "cat-calcas",
    marca: "Quirino",
    preco: 239.9,
    eh_destaque: true,
    criado_em: "2026-09-14T12:00:00Z",
    imagens: [img("1594633312681-425c7b97ccd1")],
    tamanhos: ["P", "M", "G", "GG"],
    cores: ["Rosé"],
    estoque: { "P|Rosé": 4, "M|Rosé": 4, "G|Rosé": 4, "GG|Rosé": 2 },
  }),
  build({
    id: "p-13",
    slug: "calca-wide-leg-preta",
    nome: "Calça Wide Leg",
    descricao:
      "Wide leg em sarja pesada preta. Cintura alta, pences frontais e caimento fluido. Peça-chave para looks monocromáticos.",
    categoria_id: "cat-calcas",
    marca: "Quirino",
    preco: 249.9,
    criado_em: "2026-04-22T12:00:00Z",
    imagens: [img("1624378439575-d8705ad7ae80")],
    tamanhos: CALCA,
    cores: ["Preto"],
  }),

  build({
    id: "p-14",
    slug: "jaqueta-biker-couro-sintetico",
    nome: "Jaqueta Biker",
    descricao:
      "Jaqueta biker em couro sintético premium com zíperes assimétricos e forro acetinado. Ombros estruturados, cinto na barra.",
    categoria_id: "cat-jaquetas",
    marca: "Quirino",
    preco: 399.9,
    eh_destaque: true,
    criado_em: "2026-08-28T12:00:00Z",
    imagens: [img("1551028719-00167b16eac5")],
    tamanhos: ROUPA,
    cores: ["Preto"],
    estoque: { "P|Preto": 1, "M|Preto": 3, "G|Preto": 2, "GG|Preto": 1 },
  }),
  build({
    id: "p-15",
    slug: "jaqueta-bomber-rose",
    nome: "Jaqueta Bomber",
    descricao:
      "Bomber clássica em nylon acetinado com ribana na gola, punhos e barra. Bolso na manga e forro leve. Cor rosé terroso.",
    categoria_id: "cat-jaquetas",
    marca: "Sunset Co.",
    preco: 349.9,
    preco_promocional: 279.9,
    eh_promocao: true,
    criado_em: "2026-05-30T12:00:00Z",
    imagens: [img("1591047139829-d91aecb6caea")],
    tamanhos: ["M", "G", "GG"],
    cores: ["Rosé"],
  }),
  build({
    id: "p-16",
    slug: "jaqueta-jeans-trucker",
    nome: "Jaqueta Jeans Trucker",
    descricao:
      "Trucker jacket em denim índigo 13 oz com gola em corduroy caramelo. Bolsos frontais com lapela, botões metálicos.",
    categoria_id: "cat-jaquetas",
    marca: "Quirino Denim",
    preco: 329.9,
    eh_mais_vendido: true,
    criado_em: "2026-07-22T12:00:00Z",
    imagens: [img("1611312449408-fcece27cdbb7")],
    tamanhos: ROUPA,
    cores: ["Índigo"],
    estoque: { "P|Índigo": 2, "M|Índigo": 5, "G|Índigo": 4, "GG|Índigo": 2 },
  }),

  build({
    id: "p-17",
    slug: "bone-dad-hat-denim",
    nome: "Boné Dad Hat Denim",
    descricao:
      "Dad hat em denim lavado com bordado de palmeira. Aba curva, fecho de fivela metálica. Tamanho ajustável.",
    categoria_id: "cat-bones",
    marca: "Quirino",
    preco: 89.9,
    criado_em: "2026-09-01T12:00:00Z",
    imagens: [img("1534215754734-18e55d13e346")],
    tamanhos: UNICO,
    cores: ["Azul"],
    estoque: { "Único|Azul": 12 },
  }),
  build({
    id: "p-18",
    slug: "bone-trucker",
    nome: "Boné Trucker",
    descricao:
      "Trucker com tela traseira respirável e frente em espuma. Aba levemente curva, fecho snapback.",
    categoria_id: "cat-bones",
    marca: "Quirino",
    preco: 79.9,
    preco_promocional: 59.9,
    eh_promocao: true,
    eh_mais_vendido: true,
    criado_em: "2026-06-12T12:00:00Z",
    imagens: [img("1588850561407-ed78c282e89b")],
    tamanhos: UNICO,
    cores: ["Branco", "Preto"],
    estoque: { "Único|Branco": 8, "Único|Preto": 5 },
  }),

  build({
    id: "p-19",
    slug: "tenis-runner-red",
    nome: "Tênis Runner Red",
    descricao:
      "Runner leve com cabedal em malha knit respirável e entressola em espuma de alto retorno. Solado em borracha com tração multidirecional.",
    categoria_id: "cat-tenis",
    marca: "Runner Lab",
    preco: 499.9,
    eh_destaque: true,
    criado_em: "2026-08-15T12:00:00Z",
    imagens: [img("1542291026-7eec264c27ff")],
    tamanhos: TENIS,
    cores: ["Vermelho"],
    estoque: {
      "38|Vermelho": 1,
      "39|Vermelho": 2,
      "40|Vermelho": 3,
      "41|Vermelho": 3,
      "42|Vermelho": 2,
      "43|Vermelho": 0,
    },
  }),
  build({
    id: "p-20",
    slug: "tenis-high-retro-red-black",
    nome: "Tênis High Retro",
    descricao:
      "Cano alto retrô em couro legítimo com colarinho acolchoado. Combinação clássica vermelho/preto/branco. Solado cupsole em borracha.",
    categoria_id: "cat-tenis",
    marca: "Court Kings",
    preco: 799.9,
    preco_promocional: 699.9,
    eh_promocao: true,
    eh_mais_vendido: true,
    criado_em: "2026-07-30T12:00:00Z",
    imagens: [img("1552346154-21d32810aba3"), img("1597045566677-8cf032ed6634")],
    tamanhos: TENIS,
    cores: ["Vermelho/Preto"],
    estoque: {
      "38|Vermelho/Preto": 0,
      "39|Vermelho/Preto": 1,
      "40|Vermelho/Preto": 2,
      "41|Vermelho/Preto": 2,
      "42|Vermelho/Preto": 1,
      "43|Vermelho/Preto": 1,
    },
  }),
  build({
    id: "p-21",
    slug: "tenis-air-low-white-orange",
    nome: "Tênis Air Low",
    descricao:
      "Cano baixo com unidade de amortecimento visível no calcanhar. Cabedal em mesh e camurça sintética. Branco com detalhes laranja.",
    categoria_id: "cat-tenis",
    marca: "Runner Lab",
    preco: 599.9,
    criado_em: "2026-06-25T12:00:00Z",
    imagens: [img("1600185365926-3a2ce3cdb9eb")],
    tamanhos: TENIS,
    cores: ["Branco/Laranja"],
    estoque: {
      "38|Branco/Laranja": 2,
      "39|Branco/Laranja": 2,
      "40|Branco/Laranja": 4,
      "41|Branco/Laranja": 3,
      "42|Branco/Laranja": 2,
      "43|Branco/Laranja": 1,
    },
  }),
  build({
    id: "p-22",
    slug: "tenis-court-branco",
    nome: "Tênis Court Branco",
    descricao:
      "Court clássico em couro branco com solado de borracha vulcanizada. Minimalista, versátil e fácil de limpar.",
    categoria_id: "cat-tenis",
    marca: "Court Kings",
    preco: 349.9,
    criado_em: "2026-09-13T12:00:00Z",
    imagens: [img("1608231387042-66d1773070a5")],
    tamanhos: TENIS,
    cores: ["Branco"],
  }),
];
