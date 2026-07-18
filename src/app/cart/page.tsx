"use client";

import { useCart } from "@/store/cart";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-background" />; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Keranjang Belanja</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Keranjang Anda kosong</h2>
            <p className="text-muted-foreground mb-6">Yuk, temukan karya pengrajin lokal yang menarik!</p>
            <Link 
              href="/search" 
              className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-4">
                  <h2 className="font-semibold text-lg text-foreground">Item Pesanan ({items.length})</h2>
                  <button 
                    onClick={clearCart}
                    className="text-sm font-semibold text-destructive hover:underline"
                  >
                    Kosongkan
                  </button>
                </div>
                
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {/* Photo */}
                      <div className="h-24 w-24 rounded-lg bg-accent overflow-hidden shrink-0 relative border border-border">
                        {item.photo ? (
                          <Image src={item.photo} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Dari: <span className="font-semibold text-primary">{item.sellerName}</span>
                          </p>
                          <Link href={`/produk/${item.id}`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </Link>
                          <p className="font-bold text-foreground mt-1">
                            Rp {item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        
                        {/* Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center rounded-lg border border-border bg-background">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                              disabled={item.quantity >= item.maxStock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                            title="Hapus item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
                <h2 className="font-semibold text-lg text-foreground mb-4">Ringkasan Belanja</h2>
                
                <div className="space-y-3 text-sm border-b border-border/50 pb-4 mb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Harga ({items.reduce((a, b) => a + b.quantity, 0)} barang)</span>
                    <span>Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Ongkos Kirim</span>
                    <span>Dihitung saat checkout</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center font-bold text-lg mb-6">
                  <span>Total Belanja</span>
                  <span className="text-primary">Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                </div>
                
                <Link 
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
                >
                  Lanjut ke Pembayaran <ArrowRight className="h-4 w-4" />
                </Link>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami.
                </p>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
