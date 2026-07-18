"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

const HERO_SLIDES_ID = [
  {
    tag: "Otentik & Handmade",
    title: "Temukan Keunikan Karya Anak Bangsa",
    subtitle: "Dukung pengrajin lokal dan temukan karya seni otentik dari seluruh pelosok Nusantara.",
    image: "/hero_banner.png",
    btnText: "Jelajahi Sekarang",
    btnHref: "/search",
  },
  {
    tag: "Batik & Tenun",
    title: "Keindahan Warisan Wastra Nusantara",
    subtitle: "Jelajahi koleksi batik tulis premium dan kain tenun ikat hasil karya maestro pengrajin daerah.",
    image: "/hero_banner_batik.png",
    btnText: "Lihat Koleksi Batik",
    btnHref: "/search?category=batik",
  },
  {
    tag: "Ukiran Kayu Jati",
    title: "Sentuhan Seni Kayu Alami & Abadi",
    subtitle: "Ubah sudut ruangan Anda dengan ukiran jati solid, nampan estetik, dan dekorasi kayu ramah lingkungan.",
    image: "/hero_banner_woodcraft.png",
    btnText: "Lihat Kerajinan Kayu",
    btnHref: "/search?category=wood-craft",
  },
  {
    tag: "Keramik Kasongan",
    title: "Sentuhan Kehangatan Gerabah Kasongan",
    subtitle: "Miliki cangkir, vas, dan kendi keramik buatan tangan dengan tekstur tanah liat alami yang menenangkan.",
    image: "/hero_banner_pottery.png",
    btnText: "Lihat Koleksi Keramik",
    btnHref: "/search?category=pottery",
  },
  {
    tag: "Perhiasan Artisan",
    title: "Pesona Perhiasan Perak Ukir Bali",
    subtitle: "Kilau perak murni bermotif tradisional buatan tangan para perajin Gianyar untuk penampilan anggun.",
    image: "/hero_banner_batik.png",
    btnText: "Cari Perhiasan Perak",
    btnHref: "/search?category=jewelry",
  },
  {
    tag: "Karya Manual",
    title: "Karya Manual Berjiwa Seni Tinggi",
    subtitle: "Setiap produk menyimpan cerita dedikasi, ketelitian, dan cinta dari tangan-tangan kreatif lokal.",
    image: "/hero_banner_woodcraft.png",
    btnText: "Temukan Karya Seni",
    btnHref: "/search",
  },
  {
    tag: "Pre-Order Custom",
    title: "Wujudkan Pesanan Custom Impian Anda",
    subtitle: "Minta karya seni sesuai spesifikasi khusus Anda langsung ke pengrajin favorit tanpa perantara.",
    image: "/hero_banner_pottery.png",
    btnText: "Minta Pesanan Custom",
    btnHref: "/dashboard/custom-requests",
  },
  {
    tag: "Home Decor",
    title: "Dekorasi Rumah Berkarakter & Estetik",
    subtitle: "Hadirkan suasana hangat bohemian dengan simpul macrame, anyaman rotan, dan pajangan unik.",
    image: "/hero_banner.png",
    btnText: "Lihat Dekorasi Rumah",
    btnHref: "/search?category=home-decor",
  },
  {
    tag: "Dukung UMKM",
    title: "Bangga Buatan Pengrajin UMKM Indonesia",
    subtitle: "Bantu memperkuat ekonomi kreatif lokal dengan mengapresiasi setiap helai benang dan pecahan ukiran.",
    image: "/hero_banner_batik.png",
    btnText: "Dukung Pengrajin",
    btnHref: "/search",
  },
  {
    tag: "Kado Eksklusif",
    title: "Hadiah Unik Berkesan Tak Terlupakan",
    subtitle: "Temukan souvenir eksklusif dan kado unik berkesan untuk momen berharga orang tercinta.",
    image: "/hero_banner_woodcraft.png",
    btnText: "Cari Kado Spesial",
    btnHref: "/search",
  },
];

const HERO_SLIDES_EN = [
  {
    tag: "Authentic & Handmade",
    title: "Discover Unique Creations by Local Artisans",
    subtitle: "Support local artisans and find authentic artworks from all corners of the Archipelago.",
    image: "/hero_banner.png",
    btnText: "Explore Now",
    btnHref: "/search",
  },
  {
    tag: "Batik & Weaving",
    title: "The Elegance of Archipelago Textile Heritage",
    subtitle: "Explore premium hand-painted batik and ikat woven fabrics crafted by master regional artisans.",
    image: "/hero_banner_batik.png",
    btnText: "Explore Batik Collection",
    btnHref: "/search?category=batik",
  },
  {
    tag: "Teak Wood Crafts",
    title: "Natural & Timeless Teak Wood Artistry",
    subtitle: "Transform your spaces with solid teak carvings, aesthetic trays, and eco-friendly wooden decor.",
    image: "/hero_banner_woodcraft.png",
    btnText: "View Woodcrafts",
    btnHref: "/search?category=wood-craft",
  },
  {
    tag: "Kasongan Pottery",
    title: "Warm Touch of Kasongan Clay Pottery",
    subtitle: "Own handmade ceramic mugs, vases, and pottery with calming natural clay textures.",
    image: "/hero_banner_pottery.png",
    btnText: "View Pottery Collection",
    btnHref: "/search?category=pottery",
  },
  {
    tag: "Artisan Jewelry",
    title: "Charming Hand-Carved Bali Silver Jewelry",
    subtitle: "Shine with pure silver filigree crafted by traditional Gianyar artisans for an elegant look.",
    image: "/hero_banner_batik.png",
    btnText: "Search Silver Jewelry",
    btnHref: "/search?category=jewelry",
  },
  {
    tag: "Manual Craftsmanship",
    title: "Handcrafted Artistry With High Spirit",
    subtitle: "Every item holds a story of dedication, precision, and passion from local creative hands.",
    image: "/hero_banner_woodcraft.png",
    btnText: "Discover Fine Arts",
    btnHref: "/search",
  },
  {
    tag: "Custom Pre-Order",
    title: "Realize Your Dream Custom Order",
    subtitle: "Request personalized artwork specifying your exact requirements directly from your favorite artisan.",
    image: "/hero_banner_pottery.png",
    btnText: "Request Custom Order",
    btnHref: "/dashboard/custom-requests",
  },
  {
    tag: "Home Decor",
    title: "Aesthetic & Characterful Home Decor",
    subtitle: "Bring warm bohemian ambiance with macrame knots, rattan weaving, and unique wall displays.",
    image: "/hero_banner.png",
    btnText: "Explore Home Decor",
    btnHref: "/search?category=home-decor",
  },
  {
    tag: "Support Local SMEs",
    title: "Proudly Made by Indonesian SME Artisans",
    subtitle: "Empower the local creative economy by appreciating every thread and wood carving detail.",
    image: "/hero_banner_batik.png",
    btnText: "Support Artisans",
    btnHref: "/search",
  },
  {
    tag: "Exclusive Gifts",
    title: "Unforgettable & Unique Artisanal Gifts",
    subtitle: "Find exclusive souvenirs and memorable handcrafted gifts for your loved ones' special moments.",
    image: "/hero_banner_woodcraft.png",
    btnText: "Find Special Gifts",
    btnHref: "/search",
  },
];

export default function HomeClient({ 
  categories, 
  featuredProducts, 
  newArrivals 
}: { 
  categories: any[];
  featuredProducts: any[];
  newArrivals: any[];
}) {
  const { t, language } = useLanguage();
  const heroSlides = language === "en" ? HERO_SLIDES_EN : HERO_SLIDES_ID;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play timer every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const slide = heroSlides[currentSlide] || heroSlides[0];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="flex flex-col w-full bg-background min-h-screen">
      
      {/* ════════════════════════════════════════════════════════
          DYNAMIC ANIMATED HERO SLIDER (Fade & Slide Transitions)
          ════════════════════════════════════════════════════════ */}
      <section 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full h-[450px] md:h-[540px] flex items-center justify-center overflow-hidden group"
      >
        {/* Background Images with smooth opacity fade */}
        {heroSlides.map((s, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
          >
            <Image 
              src={s.image} 
              alt={s.title} 
              fill 
              className="object-cover object-center scale-105 transition-transform duration-10000 ease-linear"
              priority={index === 0}
            />
            {/* Subtle dark overlay for contrast */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
          </div>
        ))}

        {/* Text Overlay Box with Smooth Transition */}
        <div className="relative z-10 bg-background/90 backdrop-blur-md p-6 sm:p-10 md:p-12 rounded-3xl shadow-2xl max-w-2xl mx-4 text-center border border-border/50 transition-all duration-500 transform">
          
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{slide.tag}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight leading-tight">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground mb-6 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            {slide.subtitle}
          </p>

          {/* Button */}
          <Link 
            href={slide.btnHref} 
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-xs sm:text-sm font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
            {slide.btnText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Navigation Arrow Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/80 hover:bg-background text-foreground backdrop-blur-md border border-border/50 flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/80 hover:bg-background text-foreground backdrop-blur-md border border-border/50 flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Counter & Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/40 shadow-sm">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
          <span className="text-[10px] font-mono font-semibold text-foreground ml-1">
            {currentSlide + 1}/{heroSlides.length}
          </span>
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
                className="flex flex-col items-center gap-3 shrink-0 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-border bg-card flex items-center justify-center p-3 shadow-sm group-hover:border-primary group-hover:shadow-md transition-all group-hover:scale-105 overflow-hidden relative">
                  <Image 
                    src={`/category_thumb.png`} 
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURED PRODUCTS
          ════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {t.home.featured_title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t.home.featured_subtitle}
              </p>
            </div>
            <Link 
              href="/search" 
              className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1"
            >
              {t.home.see_all} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          NEW ARRIVALS
          ════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-muted/20 border-t border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {t.home.new_arrivals}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t.home.new_arrivals_subtitle}
              </p>
            </div>
            <Link 
              href="/search?sort=latest" 
              className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1"
            >
              {t.home.see_all} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
