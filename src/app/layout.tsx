import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import AuthProvider from "@/components/providers/SessionProvider";
import CartSyncProvider from "@/components/providers/CartSyncProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Art and Craft | Indonesian Handmade, Local Artisans & UMKM",
  description:
    "Wadah e-commerce terpercaya untuk produk buatan tangan lokal khas Indonesia. Dukung pengrajin kreatif nusantara dan UMKM mandiri dengan kualitas premium.",
  keywords: [
    "artandcraft",
    "handmade indonesia",
    "produk umkm",
    "batik tradisional",
    "kerajinan tangan",
    "artisan lokal",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <LanguageProvider>
          <AuthProvider>
            <CartSyncProvider>
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </CartSyncProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
