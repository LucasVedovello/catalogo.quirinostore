import type { Metadata } from "next";
import { BannerManager } from "@/components/admin/banner-manager";

export const metadata: Metadata = { title: "Banners" };

export default function AdminBannersPage() {
  return <BannerManager />;
}
