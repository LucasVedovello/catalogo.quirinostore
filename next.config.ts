import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages não tem o otimizador de imagens do Next — servimos as URLs direto.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
    ],
  },
  async redirects() {
    return [{ source: "/admin", destination: "/admin/produtos", permanent: false }];
  },
};

export default nextConfig;
