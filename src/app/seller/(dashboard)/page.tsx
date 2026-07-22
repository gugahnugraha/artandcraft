import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Package, ShoppingBag, CreditCard, TrendingUp, AlertCircle, BarChart3, Star } from "lucide-react";
import Link from "next/link";
import { subDays, format } from "date-fns";
import { id as localeId, enUS as localeEn } from "date-fns/locale";
import { cookies } from "next/headers";
import { id as idDict } from "@/locales/id";
import { en as enDict } from "@/locales/en";
import SellerAnalyticsChart from "./SellerAnalyticsChart";
import TopProductsList from "./TopProductsList";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const t = lang === "en" ? enDict : idDict;
  const dateLocale = lang === "en" ? localeEn : localeId;

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

  // --- ANALYTICS DATA FETCHING (Last 30 Days) ---
  const thirtyDaysAgo = subDays(new Date(), 30);
  
  const historicalOrderItems = await prisma.orderItem.findMany({
    where: {
      product: { sellerId: sellerProfile.id },
      order: {
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: thirtyDaysAgo }
      }
    },
    include: {
      order: { select: { createdAt: true } },
      product: { select: { id: true, title: true, slug: true, price: true, photos: true } }
    }
  });

  // 1. Aggregate Daily Revenue
  const revenueMap = new Map<string, number>();
  // Pre-fill last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    revenueMap.set(format(d, "dd MMM", { locale: dateLocale }), 0);
  }

  historicalOrderItems.forEach(item => {
    const dateStr = format(item.order.createdAt, "dd MMM", { locale: dateLocale });
    if (revenueMap.has(dateStr)) {
      revenueMap.set(dateStr, revenueMap.get(dateStr)! + (Number(item.price) * item.quantity));
    }
  });

  const chartData = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
    date,
    revenue
  }));

  // 2. Aggregate Top Products
  const productStats = new Map<string, any>();
  
  historicalOrderItems.forEach(item => {
    if (!productStats.has(item.productId)) {
      productStats.set(item.productId, {
        id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        price: Number(item.product.price),
        image: item.product.photos[0] || null,
        totalSold: 0,
        totalRevenue: 0
      });
    }
    const stat = productStats.get(item.productId);
    stat.totalSold += item.quantity;
    stat.totalRevenue += Number(item.price) * item.quantity;
  });

  const topProducts = Array.from(productStats.values())
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);
  // --- END ANALYTICS DATA FETCHING ---

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">{t.seller_dashboard.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t.seller_dashboard.welcome} <strong className="text-foreground">{sellerProfile.storeName}</strong> {t.seller_dashboard.today}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t.seller_dashboard.active_orders}</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{distinctActiveOrders.size}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t.seller_dashboard.potential_revenue}</h3>
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
            <h3 className="text-sm font-semibold text-muted-foreground">{t.seller_dashboard.total_products}</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalProducts}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t.seller_dashboard.store_rating}</h3>
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
            <h2 className="font-bold text-lg text-foreground">{t.seller_dashboard.action_required}</h2>
          </div>
          
          {distinctActiveOrders.size > 0 ? (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{t.seller_dashboard.orders_waiting.replace("{count}", distinctActiveOrders.size.toString())}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.seller_dashboard.orders_waiting_desc}</p>
              <Link href="/seller/orders" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                {t.seller_dashboard.process_now}
              </Link>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="font-bold text-foreground mb-1">{t.seller_dashboard.no_orders}</h3>
              <p className="text-sm text-muted-foreground">{t.seller_dashboard.no_orders_desc}</p>
            </div>
          )}
        </div>

        {/* Analytics Section (Chart) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t.seller_dashboard.revenue_30d}
            </h2>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <SellerAnalyticsChart data={chartData} />
          </div>
        </div>

        {/* Top Products */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            {t.seller_dashboard.top_products}
          </h2>
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <TopProductsList products={topProducts} />
          </div>
        </div>

        {/* Quick Tips */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-foreground">{t.seller_dashboard.selling_tips}</h2>
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 shadow-sm">
            <h3 className="font-bold text-primary text-sm mb-2">{t.seller_dashboard.tip_1_title}</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {t.seller_dashboard.tip_1_desc}
            </p>
            <Link href="/seller/products/new" className="text-xs font-bold text-primary hover:underline">
              {t.seller_dashboard.add_product} &rarr;
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
