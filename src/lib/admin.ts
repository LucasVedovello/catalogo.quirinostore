import type { Banner, Category, Product } from "@/types";
import { getSupabase, STORAGE_BUCKET, storagePathFromPublicUrl } from "./supabase";
import { normalizeProduct, PRODUCT_SELECT } from "./products";
import { slugify } from "./utils";

/**
 * Operações de escrita usadas pelo painel /admin.
 * Todas dependem de uma sessão do Supabase Auth (as policies de RLS exigem `authenticated`).
 */

export interface ProductInput {
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
}

export interface ImageInput {
  id?: string;
  url: string;
  ordem: number;
}

export interface VariantInput {
  id?: string;
  tamanho: string;
  cor: string;
  estoque: number;
}

function fail(prefix: string, error: { message: string } | null): never {
  throw new Error(`${prefix}: ${error?.message ?? "erro desconhecido"}`);
}

/* ---------- Produtos ---------- */

export async function adminListProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from("products")
    .select(PRODUCT_SELECT)
    .order("criado_em", { ascending: false });
  if (error) fail("Erro ao listar produtos", error);
  return (data ?? []).map(normalizeProduct);
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const { data, error } = await getSupabase()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) fail("Erro ao carregar produto", error);
  return data ? normalizeProduct(data) : null;
}

export async function adminSlugExists(slug: string, ignoreId?: string | null): Promise<boolean> {
  let q = getSupabase().from("products").select("id").eq("slug", slug).limit(1);
  if (ignoreId) q = q.neq("id", ignoreId);
  const { data, error } = await q;
  if (error) fail("Erro ao validar slug", error);
  return (data ?? []).length > 0;
}

/**
 * Cria/atualiza o produto e sincroniza imagens e variantes.
 * Retorna o id do produto.
 */
export async function adminSaveProduct(
  id: string | null,
  input: ProductInput,
  images: ImageInput[],
  variants: VariantInput[],
): Promise<string> {
  const sb = getSupabase();
  const current = id ? await adminGetProduct(id) : null;

  // 1) produto
  let productId = id;
  if (productId) {
    const { error } = await sb.from("products").update(input).eq("id", productId);
    if (error) fail("Erro ao atualizar produto", error);
  } else {
    const { data, error } = await sb.from("products").insert(input).select("id").single();
    if (error || !data) fail("Erro ao criar produto", error);
    productId = data.id as string;
  }

  // 2) imagens
  const keepImageIds = new Set(images.filter((i) => i.id).map((i) => i.id as string));
  const removedImages = (current?.imagens ?? []).filter((img) => !keepImageIds.has(img.id));
  if (removedImages.length > 0) {
    const { error } = await sb
      .from("product_images")
      .delete()
      .in(
        "id",
        removedImages.map((i) => i.id),
      );
    if (error) fail("Erro ao remover imagens", error);
    await deleteStorageFiles(removedImages.map((i) => i.url));
  }
  for (const img of images) {
    if (img.id) {
      const before = current?.imagens.find((c) => c.id === img.id);
      if (before && before.ordem !== img.ordem) {
        const { error } = await sb.from("product_images").update({ ordem: img.ordem }).eq("id", img.id);
        if (error) fail("Erro ao reordenar imagens", error);
      }
    } else {
      const { error } = await sb
        .from("product_images")
        .insert({ product_id: productId, url: img.url, ordem: img.ordem });
      if (error) fail("Erro ao salvar imagem", error);
    }
  }

  // 3) variantes
  const keepVariantIds = new Set(variants.filter((v) => v.id).map((v) => v.id as string));
  const removedVariants = (current?.variantes ?? []).filter((v) => !keepVariantIds.has(v.id));
  if (removedVariants.length > 0) {
    const { error } = await sb
      .from("product_variants")
      .delete()
      .in(
        "id",
        removedVariants.map((v) => v.id),
      );
    if (error) fail("Erro ao remover variantes", error);
  }
  for (const v of variants) {
    const payload = { tamanho: v.tamanho.trim(), cor: v.cor.trim(), estoque: Math.max(0, Math.floor(v.estoque)) };
    if (v.id) {
      const before = current?.variantes.find((c) => c.id === v.id);
      const changed =
        !before ||
        before.tamanho !== payload.tamanho ||
        before.cor !== payload.cor ||
        before.estoque !== payload.estoque;
      if (changed) {
        const { error } = await sb.from("product_variants").update(payload).eq("id", v.id);
        if (error) fail("Erro ao atualizar variante", error);
      }
    } else {
      const { error } = await sb.from("product_variants").insert({ product_id: productId, ...payload });
      if (error) fail("Erro ao criar variante", error);
    }
  }

  return productId as string;
}

export async function adminPatchProduct(
  id: string,
  patch: Partial<Pick<Product, "ativo" | "eh_destaque" | "eh_mais_vendido" | "eh_promocao">>,
): Promise<void> {
  const { error } = await getSupabase().from("products").update(patch).eq("id", id);
  if (error) fail("Erro ao atualizar produto", error);
}

export async function adminDeleteProduct(product: Product): Promise<void> {
  // FKs com ON DELETE CASCADE removem imagens e variantes no banco.
  const { error } = await getSupabase().from("products").delete().eq("id", product.id);
  if (error) fail("Erro ao excluir produto", error);
  await deleteStorageFiles(product.imagens.map((i) => i.url));
}

/* ---------- Storage ---------- */

export async function uploadProductImage(file: File, folder: string): Promise<string> {
  const sb = getSupabase();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeFolder = slugify(folder) || "produto";
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await sb.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) fail(`Erro ao enviar "${file.name}"`, error);

  const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Remove do Storage os arquivos que pertencem ao nosso bucket (ignora URLs externas). */
export async function deleteStorageFiles(urls: string[]): Promise<void> {
  const paths = urls
    .map(storagePathFromPublicUrl)
    .filter((p): p is string => Boolean(p));
  if (paths.length === 0) return;
  const { error } = await getSupabase().storage.from(STORAGE_BUCKET).remove(paths);
  if (error) console.warn("[admin] falha ao remover arquivos do storage:", error.message);
}

/* ---------- Categorias ---------- */

export async function adminListCategories(): Promise<Category[]> {
  const { data, error } = await getSupabase()
    .from("categories")
    .select("*")
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });
  if (error) fail("Erro ao listar categorias", error);
  return data ?? [];
}

export async function adminSaveCategory(
  cat: Omit<Category, "id"> & { id?: string },
): Promise<Category> {
  const sb = getSupabase();
  const payload = { nome: cat.nome.trim(), slug: slugify(cat.slug || cat.nome), ordem: cat.ordem };
  if (cat.id) {
    const { data, error } = await sb.from("categories").update(payload).eq("id", cat.id).select().single();
    if (error || !data) fail("Erro ao atualizar categoria", error);
    return data as Category;
  }
  const { data, error } = await sb.from("categories").insert(payload).select().single();
  if (error || !data) fail("Erro ao criar categoria", error);
  return data as Category;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  const { error } = await getSupabase().from("categories").delete().eq("id", id);
  if (error) fail("Erro ao excluir categoria", error);
}

/* ---------- Banners ---------- */

export async function adminListBanners(): Promise<Banner[]> {
  const { data, error } = await getSupabase().from("banners").select("*").order("ordem", { ascending: true });
  if (error) fail("Erro ao listar banners", error);
  return data ?? [];
}

export async function adminSaveBanner(banner: Omit<Banner, "id"> & { id?: string }): Promise<Banner> {
  const sb = getSupabase();
  const payload = {
    texto: banner.texto?.trim() || null,
    imagem: banner.imagem?.trim() || null,
    ativo: banner.ativo,
    ordem: banner.ordem,
  };
  if (banner.id) {
    const { data, error } = await sb.from("banners").update(payload).eq("id", banner.id).select().single();
    if (error || !data) fail("Erro ao atualizar banner", error);
    return data as Banner;
  }
  const { data, error } = await sb.from("banners").insert(payload).select().single();
  if (error || !data) fail("Erro ao criar banner", error);
  return data as Banner;
}

export async function adminDeleteBanner(id: string): Promise<void> {
  const { error } = await getSupabase().from("banners").delete().eq("id", id);
  if (error) fail("Erro ao excluir banner", error);
}
