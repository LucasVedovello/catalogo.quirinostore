import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Novo produto" };

export default function AdminNovoProdutoPage() {
  return <ProductForm />;
}
