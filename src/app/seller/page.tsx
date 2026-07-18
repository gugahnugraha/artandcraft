import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Package, ShoppingBag, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Retrieve Seller Profile
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!sellerProfile) return null;

  // Fetch quick stats
  // 1. Total Products
  const totalProducts = await prisma.product.count({
    where: { sellerId: sellerProfile.id }
  });

  // 2. Active Orders (Since orders are tied to products, we need to join OrderItem -> Product -> Seller)
  // For a marketplace, OrderItems hold the productId.
  // We want to count distinct orders that contain this seller's products and are AWAITING_PAYMENT, PAID, PROCESSING.
  const activeOrderItems = await prisma.orderItem.findMany({
    where: {
      product: { sellerId: sellerProfile.id },
      order: {
        status: { in: ["AWAITING_PAYMENT", "PAID", "PROCESSING"] }
      }
    },
    include: {
      order: true
    }
  });

  // Calculate distinct active orders and total pending revenue
  const distinctActiveOrders = new Set();
  let pendingRevenue = 0;

  activeOrderItems.forEach(item => {
    distinctActiveOrders.add(item.orderId);
    if (item.order.status === "PAID" || item.order.status === "PROCESSING") {
      pendingRevenue += Number(item.price) * item.quantity;
    }
  });

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang kembali, pantau performa toko <strong className="text-foreground">{sellerProfile.storeName}</strong> Anda hari ini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">Pesanan Aktif</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{distinctActiveOrders.size}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">Potensi Pendapatan</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">
            Rp {pendingRevenue.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">Total Produk</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalProducts}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">Rating Toko</h3>
          </div>
          <p className="text-3xl font-bold text-foreground flex items-baseline gap-1">
            {sellerProfile.storeRating.toFixed(1)} <span className="text-sm text-muted-foreground font-normal">/ 5.0</span>
          </p>
        </div>

      </div>

      {/* Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Next Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-foreground">Perlu Tindakan Anda</h2>
          </div>
          
          {distinctActiveOrders.size > 0 ? (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Ada {distinctActiveOrders.size} pesanan menunggu!</h3>
              <p className="text-sm text-muted-foreground mb-4">Segera proses pesanan pembeli agar rating toko Anda tetap baik.</p>
              <Link href="/seller/orders" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                Proses Pesanan Sekarang
              </Link>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="font-bold text-foreground mb-1">Belum ada pesanan baru</h3>
              <p className="text-sm text-muted-foreground">Ayo promosikan produk Anda atau tambah produk baru untuk menarik pembeli.</p>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-foreground">Tips Berjualan</h2>
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 shadow-sm">
            <h3 className="font-bold text-primary text-sm mb-2">📸 Foto Produk yang Menarik</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Pastikan foto kerajinan Anda memiliki pencahayaan alami dan latar belakang yang bersih. Pembeli lebih suka melihat detail tekstur barang *handmade*.
            </p>
            <Link href="/seller/products/new" className="text-xs font-bold text-primary hover:underline">
              Tambah Produk Baru &rarr;
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
