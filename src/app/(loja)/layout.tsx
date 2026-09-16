import { Header } from "@/components/layout/header";
import { Marquee } from "@/components/layout/marquee";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/drawer";
import { CartHydration } from "@/components/cart/cart-hydration";
import { getBanners, getCategories } from "@/lib/products";

// force-dynamic garante que o catálogo reflita o banco a cada request (sem rebuild).
// Roda no runtime Node do Worker (@opennextjs/cloudflare) — não usar runtime "edge".
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, banners] = await Promise.all([getCategories(), getBanners()]);

  return (
    <>
      <Header categories={categories} />
      <Marquee banners={banners} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
      <CartHydration />
    </>
  );
}
