import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";

import AuthProvider from "@/components/providers/SessionProvider";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fontSerif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArtAndCraft.id | Indonesian Handmade, Local Artisans & UMKM",
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
    <html lang="id" className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
