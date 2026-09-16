import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Categorias" };

export default function AdminCategoriasPage() {
  return <CategoryManager />;
}
