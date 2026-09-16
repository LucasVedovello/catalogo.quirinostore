import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Quirino Store — Streetwear",
    template: "%s | Quirino Store",
  },
  description:
    "Catálogo de streetwear da Quirino Store. Camisetas, moletons, calças, bonés e tênis. Monte seu carrinho e finalize o pedido pelo WhatsApp.",
  applicationName: "Quirino Store",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Quirino Store",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
