"use client";

import { useCart } from "@/store/cart";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, MapPin, Truck, ShieldCheck, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // If cart is empty and not successful yet, maybe redirect back to cart
    if (isMounted && items.length === 0 && !isSuccess) {
      router.push("/cart");
    }
  }, [isMounted, items.length, isSuccess, router]);

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const shippingAddress = {
      fullName: formData.get("fullName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      province: formData.get("province") as string,
      postalCode: formData.get("postalCode") as string,
    };
    const paymentMethod = formData.get("payment") as string;
    const shippingCost = items.length > 0 ? 25000 : 0;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress,
          paymentMethod,
          shippingCost,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setIsSuccess(true);
        clearCart();
      } else {
        if (res.status === 401) {
          router.push("/login?callbackUrl=/checkout");
        } else {
          setErrorMessage(data.error || "Gagal membuat pesanan.");
        }
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-background" />;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background py-20 flex flex-col items-center px-4">
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6 animate-bounce" />
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          Pembayaran Berhasil!
        </h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Terima kasih telah berbelanja di Art and Craft. Pesanan Anda telah diteruskan kepada pengrajin terkait dan akan segera diproses.
        </p>
        <Link 
          href="/" 
          className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // Calculate mock shipping
  const shippingCost = items.length > 0 ? 25000 : 0;
  const grandTotal = getTotalPrice() + shippingCost;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Forms */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Shipping Address */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Alamat Pengiriman
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Nama Lengkap</label>
                  <input name="fullName" required type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="Budi Santoso" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Nomor Telepon</label>
                  <input name="phoneNumber" required type="tel" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="081234567890" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Alamat Lengkap (Jalan)</label>
                  <textarea name="street" required rows={2} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="Jl. Merdeka No.1, RT/RW 01/02..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Kota</label>
                    <input name="city" required type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="Jakarta Selatan" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Provinsi</label>
                    <input name="province" required type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="DKI Jakarta" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Kode Pos</label>
                    <input name="postalCode" required type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="12345" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method (Mock) */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Metode Pembayaran
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-primary bg-primary/5 cursor-pointer">
                  <input type="radio" name="payment" value="Virtual Account" defaultChecked className="text-primary focus:ring-primary h-4 w-4" />
                  <div>
                    <p className="font-bold text-sm text-foreground">Transfer Bank Virtual Account</p>
                    <p className="text-xs text-muted-foreground">BCA, Mandiri, BNI, BRI</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                  <input type="radio" name="payment" value="E-Wallet" className="text-primary focus:ring-primary h-4 w-4" />
                  <div>
                    <p className="font-bold text-sm text-foreground">E-Wallet (QRIS)</p>
                    <p className="text-xs text-muted-foreground">GoPay, OVO, Dana, ShopeePay</p>
                  </div>
                </label>
              </div>
            </div>
            
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-lg text-foreground mb-6">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} x Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground shrink-0">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-border/50 pt-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} item)</span>
                  <span>Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1"><Truck className="h-4 w-4"/> Ongkos Kirim</span>
                  <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center font-bold text-xl mb-8 border-t border-border/50 pt-4">
                <span>Total Bayar</span>
                <span className="text-primary">Rp {grandTotal.toLocaleString("id-ID")}</span>
              </div>
              
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <button 
                type="submit"
                disabled={isProcessing || items.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Memproses...</>
                ) : (
                  <><ShieldCheck className="h-5 w-5" /> Bayar Sekarang</>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Transaksi dijamin aman & terenkripsi</span>
              </div>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}
