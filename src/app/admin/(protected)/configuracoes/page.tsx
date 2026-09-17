import type { Metadata } from "next";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const metadata: Metadata = { title: "Configurações" };

export default function AdminConfiguracoesPage() {
  return <SiteSettingsForm />;
}
