import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

// Rota dinâmica sem generateStaticParams → precisa do edge runtime no Cloudflare Pages.
export const runtime = "edge";

export const metadata: Metadata = { title: "Editar produto" };

export default async function AdminEditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductForm productId={id} />;
}
