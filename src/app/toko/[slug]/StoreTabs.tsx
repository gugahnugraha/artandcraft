"use client";

import { useState } from "react";
import { Star, ShoppingBag, MessageSquare } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

interface StoreTabsProps {
  products: any[];
  reviews: any[];
  storeName: string;
}

export default function StoreTabs({ products, reviews, storeName }: StoreTabsProps) {
  const [activeTab, setActiveTab] = useState<"products" | "reviews">("products");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 font-semibold text-sm transition-colors relative ${
            activeTab === "products"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Produk ({products.length})
          {activeTab === "products" && (
            <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 font-semibold text-sm transition-colors relative ${
            activeTab === "reviews"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Ulasan Pembeli ({reviews.length})
          {activeTab === "reviews" && (
            <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "products" ? (
          products.length === 0 ? (
            <div className="text-center border border-dashed border-border rounded-2xl py-16 bg-card">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h4 className="font-serif text-lg font-bold text-foreground mb-1">
                Koleksi Masih Kosong
              </h4>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Pengrajin ini sedang mempersiapkan karya-karya baru untuk diluncurkan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  title={prod.title}
                  slug={prod.slug}
                  price={prod.price}
                  discount={prod.discount}
                  photos={prod.photos}
                  categoryName={prod.categoryName}
                  sellerName={prod.sellerName}
                  rating={prod.rating}
                  reviewsCount={prod.reviewsCount}
                />
              ))}
            </div>
          )
        ) : reviews.length === 0 ? (
          <div className="text-center border border-dashed border-border rounded-2xl py-16 bg-card">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h4 className="font-serif text-lg font-bold text-foreground mb-1">
              Belum Ada Ulasan
            </h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Toko ini belum menerima ulasan dari pembeli. Jadilah yang pertama!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0">
                      {review.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={review.user.image}
                          alt={review.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground bg-primary/10">
                          {review.user.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {review.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "fill-amber-500" : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                    "{review.comment}"
                  </p>
                )}

                <div className="text-xs text-muted-foreground border-t border-border/50 pt-3">
                  Barang dibeli: <span className="font-semibold">{review.product.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
