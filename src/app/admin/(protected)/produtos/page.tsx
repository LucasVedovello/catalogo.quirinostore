import type { Metadata } from "next";
import { ProductTable } from "@/components/admin/product-table";

export const metadata: Metadata = { title: "Produtos" };

export default function AdminProdutosPage() {
  return <ProductTable />;
}
