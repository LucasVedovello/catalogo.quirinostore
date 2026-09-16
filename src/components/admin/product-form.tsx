"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import type { Category, Product } from "@/types";
import {
  adminDeleteProduct,
  adminGetProduct,
  adminListCategories,
  adminSaveProduct,
  adminSlugExists,
  type ProductInput,
} from "@/lib/admin";
import { formatPrice, slugify } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { AdminPageHeader, ErrorBanner } from "./admin-shell";
import { ImageUploader, type UploaderImage } from "./image-uploader";
import { VariantEditor, type EditableVariant } from "./variant-editor";

interface ProductFormProps {
  /** undefined → criação */
  productId?: string;
}

interface FormState {
  nome: string;
  slug: string;
  slugTouched: boolean;
  descricao: string;
  categoria_id: string;
  marca: string;
  preco: string;
  preco_promocional: string;
  eh_promocao: boolean;
  eh_destaque: boolean;
  eh_mais_vendido: boolean;
  ativo: boolean;
}

const EMPTY: FormState = {
  nome: "",
  slug: "",
  slugTouched: false,
  descricao: "",
  categoria_id: "",
  marca: "",
  preco: "",
  preco_promocional: "",
  eh_promocao: false,
  eh_destaque: false,
  eh_mais_vendido: false,
  ativo: true,
};

const parseMoney = (v: string): number | null => {
  if (!v.trim()) return null;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

const moneyToInput = (n: number | null) => (n === null ? "" : n.toFixed(2).replace(".", ","));

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<UploaderImage[]>([]);
  const [variants, setVariants] = useState<EditableVariant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [original, setOriginal] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState | "variants" | "images", string>>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, product] = await Promise.all([
          adminListCategories(),
          productId ? adminGetProduct(productId) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setCategories(cats);
        if (productId && !product) {
          setError("Produto não encontrado.");
        } else if (product) {
          setOriginal(product);
          setForm({
            nome: product.nome,
            slug: product.slug,
            slugTouched: true,
            descricao: product.descricao ?? "",
            categoria_id: product.categoria_id ?? "",
            marca: product.marca ?? "",
            preco: moneyToInput(product.preco),
            preco_promocional: moneyToInput(product.preco_promocional),
            eh_promocao: product.eh_promocao,
            eh_destaque: product.eh_destaque,
            eh_mais_vendido: product.eh_mais_vendido,
            ativo: product.ativo,
          });
          setImages(product.imagens.map((img) => ({ id: img.id, url: img.url, key: img.id })));
          setVariants(
            product.variantes.map((v) => ({
              id: v.id,
              key: v.id,
              tamanho: v.tamanho,
              cor: v.cor,
              estoque: v.estoque,
            })),
          );
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "nome" && !f.slugTouched) next.slug = slugify(value as string);
      return next;
    });

  const preco = parseMoney(form.preco);
  const precoPromo = parseMoney(form.preco_promocional);
  const desconto = useMemo(() => {
    if (!form.eh_promocao || preco === null || precoPromo === null || precoPromo >= preco || preco <= 0) return null;
    return Math.round((1 - precoPromo / preco) * 100);
  }, [form.eh_promocao, preco, precoPromo]);

  const validate = async (): Promise<boolean> => {
    const errs: typeof fieldErrors = {};
    if (form.nome.trim().length < 2) errs.nome = "Informe o nome do produto.";
    const slug = slugify(form.slug || form.nome);
    if (!slug) errs.slug = "Slug inválido.";
    else if (await adminSlugExists(slug, productId)) errs.slug = "Já existe um produto com esse slug.";
    if (preco === null || preco < 0) errs.preco = "Informe um preço válido.";
    if (form.eh_promocao) {
      if (precoPromo === null) errs.preco_promocional = "Informe o preço promocional.";
      else if (preco !== null && precoPromo >= preco) errs.preco_promocional = "Deve ser menor que o preço cheio.";
    }
    const cleaned = variants.filter((v) => v.tamanho.trim() || v.cor.trim());
    if (cleaned.some((v) => !v.tamanho.trim() || !v.cor.trim())) errs.variants = "Toda variante precisa de tamanho e cor.";
    const keys = cleaned.map((v) => `${v.tamanho.trim().toUpperCase()}|${v.cor.trim().toUpperCase()}`);
    if (new Set(keys).size !== keys.length) errs.variants = "Há combinações tamanho + cor repetidas.";
    if (cleaned.length === 0) errs.variants = "Cadastre ao menos uma variante (tamanho + cor + estoque).";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!(await validate())) {
        setSaving(false);
        return;
      }
      const input: ProductInput = {
        nome: form.nome.trim(),
        slug: slugify(form.slug || form.nome),
        descricao: form.descricao.trim() || null,
        categoria_id: form.categoria_id || null,
        marca: form.marca.trim() || null,
        preco: preco ?? 0,
        preco_promocional: precoPromo,
        eh_promocao: form.eh_promocao,
        eh_destaque: form.eh_destaque,
        eh_mais_vendido: form.eh_mais_vendido,
        ativo: form.ativo,
      };
      const cleanedVariants = variants
        .filter((v) => v.tamanho.trim() || v.cor.trim())
        .map((v) => ({ id: v.id, tamanho: v.tamanho, cor: v.cor, estoque: v.estoque }));

      await adminSaveProduct(
        productId ?? null,
        input,
        images.map((img, i) => ({ id: img.id, url: img.url, ordem: i })),
        cleanedVariants,
      );
      router.push("/admin/produtos");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!original) return;
    if (!window.confirm(`Excluir "${original.nome}"? Essa ação não pode ser desfeita.`)) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(original);
      router.push("/admin/produtos");
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      <AdminPageHeader
        title={isEdit ? "Editar produto" : "Novo produto"}
        description={isEdit ? original?.nome : "Preencha os dados, envie as fotos e monte a grade de variantes."}
        actions={
          <>
            <Link href="/admin/produtos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
            {isEdit && original && (
              <Link
                href={`/produtos/${original.slug}`}
                target="_blank"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Ver na loja <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </>
        }
      />

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          {/* Dados básicos */}
          <Section title="Informações">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" htmlFor="nome" error={fieldErrors.nome} className="sm:col-span-2">
                <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} required />
              </Field>
              <Field label="Slug (URL)" htmlFor="slug" error={fieldErrors.slug} hint={`/produtos/${slugify(form.slug || form.nome) || "…"}`}>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))}
                  onBlur={() => setForm((f) => ({ ...f, slug: slugify(f.slug) }))}
                />
              </Field>
              <Field label="Marca" htmlFor="marca">
                <Input id="marca" value={form.marca} onChange={(e) => set("marca", e.target.value)} placeholder="Ex.: Quirino" />
              </Field>
              <Field label="Categoria" htmlFor="categoria">
                <Select id="categoria" value={form.categoria_id} onChange={(e) => set("categoria_id", e.target.value)}>
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Descrição" htmlFor="descricao" className="sm:col-span-2">
                <Textarea
                  id="descricao"
                  value={form.descricao}
                  onChange={(e) => set("descricao", e.target.value)}
                  placeholder="Tecido, modelagem, cuidados…"
                  className="min-h-32"
                />
              </Field>
            </div>
          </Section>

          {/* Preço */}
          <Section title="Preço">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preço (R$)" htmlFor="preco" error={fieldErrors.preco}>
                <Input
                  id="preco"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.preco}
                  onChange={(e) => set("preco", e.target.value)}
                  required
                />
              </Field>
              <Field
                label="Preço promocional (R$)"
                htmlFor="preco_promocional"
                error={fieldErrors.preco_promocional}
                hint={desconto !== null ? `${desconto}% de desconto` : "Só vale com “Em promoção” marcado."}
              >
                <Input
                  id="preco_promocional"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.preco_promocional}
                  onChange={(e) => set("preco_promocional", e.target.value)}
                />
              </Field>
            </div>
            <Checkbox
              label="Em promoção"
              description="Exibe o preço promocional riscando o preço cheio e marca o produto com o selo de desconto."
              checked={form.eh_promocao}
              onChange={(e) => set("eh_promocao", e.target.checked)}
            />
          </Section>

          {/* Imagens */}
          <Section title="Imagens" hint="A primeira imagem é a capa. Arraste com as setas para reordenar.">
            <ImageUploader
              images={images}
              onChange={setImages}
              folder={slugify(form.slug || form.nome) || "produto"}
              onError={setError}
            />
          </Section>

          {/* Variantes */}
          <Section title="Variantes e estoque" hint="O estoque é controlado por combinação de tamanho e cor." error={fieldErrors.variants}>
            <VariantEditor variants={variants} onChange={setVariants} />
          </Section>
        </div>

        {/* Coluna lateral */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Section title="Visibilidade">
            <Checkbox
              label="Produto ativo"
              description="Desmarque para esconder da loja sem excluir."
              checked={form.ativo}
              onChange={(e) => set("ativo", e.target.checked)}
            />
            <Checkbox
              label="Destaque"
              description="Aparece na seção Destaques da home."
              checked={form.eh_destaque}
              onChange={(e) => set("eh_destaque", e.target.checked)}
            />
            <Checkbox
              label="Mais vendido"
              description="Aparece na seção Mais Vendidos e ganha selo no card."
              checked={form.eh_mais_vendido}
              onChange={(e) => set("eh_mais_vendido", e.target.checked)}
            />
          </Section>

          <Section title="Resumo">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Preço na loja</dt>
                <dd className="font-display font-bold">
                  {formatPrice(desconto !== null && precoPromo !== null ? precoPromo : (preco ?? 0))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Imagens</dt>
                <dd>{images.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Variantes</dt>
                <dd>{variants.filter((v) => v.tamanho.trim() || v.cor.trim()).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Estoque total</dt>
                <dd>{variants.reduce((a, v) => a + (Number(v.estoque) || 0), 0)}</dd>
              </div>
            </dl>
          </Section>

          {isEdit && (
            <Button type="button" variant="danger" size="sm" block onClick={handleDelete} loading={deleting}>
              <Trash2 className="h-4 w-4" /> Excluir produto
            </Button>
          )}
        </aside>
      </div>

      {/* Barra fixa de ações */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <p className="hidden text-xs text-muted sm:block">
            {isEdit ? "As alterações só valem depois de salvar." : "O produto aparece na loja assim que for salvo (se ativo)."}
          </p>
          <div className="ml-auto flex gap-2">
            <Link href="/admin/produtos" className={buttonVariants({ variant: "ghost", size: "md" })}>
              Cancelar
            </Link>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" /> {isEdit ? "Salvar alterações" : "Criar produto"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  error,
  children,
}: {
  title: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border border-border bg-surface/40 p-4 sm:p-5">
      <div>
        <h2 className="font-display text-sm font-black uppercase tracking-wide">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
      {children}
    </section>
  );
}
