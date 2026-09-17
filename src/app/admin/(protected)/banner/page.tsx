import type { Metadata } from "next";
import { HeroBannerManager } from "@/components/admin/hero-banner-manager";

export const metadata: Metadata = { title: "Banner" };

export default function AdminBannerPage() {
  return <HeroBannerManager />;
}
