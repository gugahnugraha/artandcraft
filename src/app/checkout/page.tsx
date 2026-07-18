"use client";

import { useCart } from "@/store/cart";
import { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";

declare global {
  interface Window {
    snap: any;
  }
}
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, MapPin, Truck, ShieldCheck, Loader2, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const router = useRouter();

  // Shipping cost states
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedRate, setSelectedRate] = useState<any | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newProvince, setNewProvince] = useState("");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const fetchRates = async (city: string, province: string) => {
    if (!city || !province || items.length === 0) return;
    setIsLoadingRates(true);
    setSelectedRate(null);
    try {
      const weight = items.reduce((acc, item) => acc + item.quantity * 500, 0);
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, province, weight }),
      });
      const data = await res.json();
      if (res.ok && data.rates) {
        setShippingRates(data.rates);
        if (data.rates.length > 0) {
          setSelectedRate(data.rates[0]);
        }
      } else {
        setShippingRates([]);
      }
    } catch (err) {
      console.error("Rates fetch error:", err);
      setShippingRates([]);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: getTotalPrice() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponDiscount(data.discountAmount);
        setAppliedCoupon(data.code);
        setCouponMsg({ text: data.message, type: "success" });
      } else {
        setCouponDiscount(0);
        setAppliedCoupon(null);
        setCouponMsg({ text: data.error || "Kupon tidak valid.", type: "error" });
      }
    } catch {
      setCouponMsg({ text: "Gagal menghubungi server.", type: "error" });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponMsg(null);
  };

  useEffect(() => {
    if (selectedAddressId !== "new" && addresses.length > 0) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr) {
        fetchRates(addr.city, addr.province);
      }
    } else {
      setShippingRates([]);
      setSelectedRate(null);
    }
  }, [selectedAddressId, addresses]);

  useEffect(() => {
    if (selectedAddressId === "new" && newCity.trim().length > 2 && newProvince.trim().length > 2) {
      const timer = setTimeout(() => {
        fetchRates(newCity, newProvince);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [newCity, newProvince, selectedAddressId]);

  useEffect(() => {
    setIsMounted(true);
    
    // Fetch addresses
    fetch("/api/user/addresses")
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses) {
          setAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: any) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else if (data.addresses.length > 0) {
            setSelectedAddressId(data.addresses[0].id);
          }
        }
        setIsLoadingAddresses(false);
      })
      .catch(() => setIsLoadingAddresses(false));

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
    
    let shippingAddress;
    if (selectedAddressId !== "new") {
      const selected = addresses.find(a => a.id === selectedAddressId);
      if (!selected) {
        setErrorMessage("Alamat yang dipilih tidak valid.");
        setIsProcessing(false);
        return;
      }
      shippingAddress = {
        fullName: selected.fullName,
        phoneNumber: selected.phoneNumber,
        street: selected.street,
        city: selected.city,
        province: selected.province,
        postalCode: selected.postalCode,
      };
    } else {
      shippingAddress = {
        fullName: formData.get("fullName") as string,
        phoneNumber: formData.get("phoneNumber") as string,
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        province: formData.get("province") as string,
        postalCode: formData.get("postalCode") as string,
      };
    }

    if (!selectedRate) {
      setErrorMessage(t.checkout.courier_selection);
      setIsProcessing(false);
      return;
    }

    const notes = formData.get("notes") as string;
    const paymentMethod = formData.get("payment") as string;
    const shippingCost = selectedRate.cost;
    const shippingCourier = selectedRate.name;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress,
          paymentMethod,
          shippingCost,
          shippingCourier,
          notes,
          couponCode: appliedCoupon || undefined,
          discountAmount: couponDiscount || undefined,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        if (data.token) {
          // Trigger Midtrans Snap
          window.snap.pay(data.token, {
            onSuccess: function (result: any) {
              setIsSuccess(true);
              clearCart();
            },
            onPending: function (result: any) {
              setIsSuccess(true);
              clearCart();
            },
            onError: function (result: any) {
              setErrorMessage("Pembayaran gagal. Silakan coba lagi.");
              setIsProcessing(false);
            },
            onClose: function () {
              setErrorMessage("Anda menutup popup pembayaran sebelum menyelesaikannya.");
              setIsProcessing(false);
            }
          });
        } else {
          // Fallback if no token (e.g. testing mode)
          setIsSuccess(true);
          clearCart();
          setIsProcessing(false);
        }
      } else {
        if (res.status === 401) {
          router.push("/login?callbackUrl=/checkout");
        } else {
          setErrorMessage(data.error || "Gagal membuat pesanan.");
          setIsProcessing(false);
        }
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan.");
      setIsProcessing(false);
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-background" />;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background py-20 flex flex-col items-center px-4">
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6 animate-bounce" />
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          {t.checkout.success_title}
        </h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          {t.checkout.success_desc}
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

  // Calculate dynamic shipping & coupon
  const shippingCost = selectedRate ? selectedRate.cost : 0;
  const grandTotal = Math.max(0, getTotalPrice() + shippingCost - couponDiscount);

  return (
    <div className="min-h-screen bg-background py-12">
      <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true" 
          ? "https://app.midtrans.com/snap/snap.js" 
          : "https://app.sandbox.midtrans.com/snap/snap.js"}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">{t.checkout.title}</h1>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Forms */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Shipping Address */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> {t.checkout.shipping_address}
              </h2>

              {isLoadingAddresses ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t.checkout.saved_address}</label>
                      <select 
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                      >
                        {addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label} - {a.fullName} ({a.street}, {a.city})
                          </option>
                        ))}
                        <option value="new">+ {t.checkout.new_address}</option>
                      </select>
                    </div>
                  )}

                  {selectedAddressId === "new" && (
                    <div className="space-y-4 pt-2 border-t border-border mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t.checkout.fullName}</label>
                        <input name="fullName" required type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="Budi Santoso" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t.checkout.phoneNumber}</label>
                        <input name="phoneNumber" required type="tel" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="081234567890" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t.checkout.street}</label>
                        <textarea name="street" required rows={2} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="Jl. Merdeka No.1, RT/RW 01/02..." />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t.checkout.city}</label>
                          <input name="city" required type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="Jakarta Selatan" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t.checkout.province}</label>
                          <input name="province" required type="text" value={newProvince} onChange={(e) => setNewProvince(e.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="DKI Jakarta" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{t.checkout.postalCode}</label>
                          <input name="postalCode" required type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="12345" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Courier Selection Selector */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> {t.checkout.courier_selection}
              </h2>
              
              {isLoadingRates ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">{t.checkout.loading_courier}</p>
                </div>
              ) : shippingRates.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 italic text-center">
                  {t.checkout.select_courier}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {shippingRates.map((rate, idx) => {
                    const isSelected = selectedRate?.name === rate.name;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedRate(rate)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/30 bg-background"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm text-foreground">{rate.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Estimasi: {rate.etd}</p>
                        </div>
                        <p className="font-serif font-black text-primary text-base mt-3">
                          Rp {rate.cost.toLocaleString("id-ID")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes to Seller */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                {t.checkout.notes}
              </h2>
              <textarea 
                name="notes" 
                rows={2} 
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" 
                placeholder={t.checkout.notes_placeholder} 
              />
            </div>

            {/* Payment Method (Mock) */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> {t.checkout.payment_method}
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
              <h2 className="font-bold text-lg text-foreground mb-6">{t.checkout.order_summary}</h2>
              
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

              {/* Coupon Input */}
              <div className="border-t border-border/50 pt-4 pb-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="font-mono font-bold">{appliedCoupon}</span>
                      <span className="text-xs">diterapkan</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-green-600 hover:text-green-800 font-semibold underline"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Kode kupon..."
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono tracking-wider text-foreground uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-4 py-2 text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        {isValidatingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                        Pakai
                      </button>
                    </div>
                    {couponMsg && (
                      <p className={`text-xs px-1 ${couponMsg.type === "success" ? "text-green-600" : "text-destructive"}`}>
                        {couponMsg.text}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm border-t border-border/50 pt-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.checkout.total_price} ({items.length} item)</span>
                  <span>Rp {getTotalPrice().toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1"><Truck className="h-4 w-4"/> {t.checkout.shipping_cost}</span>
                  <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Kupon ({appliedCoupon})
                    </span>
                    <span>- Rp {couponDiscount.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center font-bold text-xl mb-8 border-t border-border/50 pt-4">
                <span>{t.checkout.grand_total}</span>
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
                disabled={isProcessing || items.length === 0 || !selectedRate}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Memproses...</>
                ) : (
                  <><ShieldCheck className="h-5 w-5" /> {t.checkout.pay_now}</>
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
