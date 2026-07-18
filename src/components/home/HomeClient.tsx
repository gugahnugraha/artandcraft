"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

export default function HomeClient({ 
  categories, 
  featuredProducts, 
  newArrivals 
}: { 
  categories: any[];
  featuredProducts: any[];
  newArrivals: any[];
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col w-full bg-background min-h-screen">
      
      {/* ════════════════════════════════════════════════════════
          HERO SECTION (Full width image overlay)
          ════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero_banner.png" 
            alt="Art and Craft Hero" 
            fill 
            className="object-cover object-center"
            priority
          />
          {/* Subtle overlay to ensure text readability if needed */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 bg-background/90 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-xl max-w-2xl mx-4 text-center border border-border/50">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-4 tracking-tight">
            {t.home.hero_title}
          </h1>
          <p className="text-muted-foreground mb-8 text-sm md:text-base">
            {t.home.hero_subtitle}
          </p>
          <Link 
            href="/search" 
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            {t.home.explore_btn} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CATEGORIES ROW (Circular images)
          ════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-background border-b border-border/30">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto pb-4 hide-scrollbar justify-start md:justify-center gap-6 sm:gap-8 lg:gap-12">
            {categories.map((cat: any) => (
              <Link 
                key={cat.slug} 
                href={`/search?category=${cat.slug}`}
                className="group flex flex-col items-center flex-shrink-0 w-[100px] sm:w-[120px]"
              >
                <div className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-full border-2 border-transparent group-hover:border-primary transition-all overflow-hidden mb-3 shadow-sm relative">
                  <Image 
                    src="/category_thumb.png" 
                    alt={cat.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="text-sm font-semibold text-foreground text-center group-hover:underline underline-offset-4">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* ════════════════════════════════════════════════════════
            CURATED GRID 1: TERPOPULER
            ════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-light text-foreground">
              {t.header.gallery} Populer
            </h2>
            <Link href="/search" className="text-sm font-bold text-foreground hover:underline underline-offset-4">
              Lihat semua
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            CURATED GRID 2: BARU DITAMBAHKAN
            ════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-light text-foreground">
              Baru Saja Hadir
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            INFO / SEO FOOTER CONTENT
            ════════════════════════════════════════════════════════ */}
        <section className="py-16 border-t border-border/40 text-center max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl font-light text-foreground mb-6">
            Mendukung Pengrajin Lokal Indonesia
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            Art and Craft adalah pasar global online untuk kerajinan tangan yang unik dan kreatif.
            Ini adalah rumah bagi semesta karya buatan tangan yang istimewa, mulai dari perhiasan etnik unik
            hingga dekorasi rumah bernuansa tradisional nusantara.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-bold">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">✓</span>
              Karya Asli Handmade
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">✓</span>
              Pemberdayaan UMKM
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">✓</span>
              Kualitas Terjamin
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
