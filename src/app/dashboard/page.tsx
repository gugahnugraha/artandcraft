import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShoppingBag, Package, Heart, MapPin,
  ArrowRight, Clock, CheckCircle2, Truck
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard Saya | ArtAndCraft.id",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  AWAITING_PAYMENT: "bg-orange-100 text-orange-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu",
  AWAITING_PAYMENT: "Menunggu Bayar",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const [orders, wishlistCount, addressCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: { select: { title: true, photos: true, slug: true } },
          },
          take: 2,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.wishlistItem
      .count({
        where: { wishlist: { userId: session.user.id } },
      })
      .catch(() => 0),
    prisma.address.count({ where: { userId: session.user.id } }).catch(() => 0),
  ]);

  const activeOrders = orders.filter((o) =>
    ["AWAITING_PAYMENT", "PAID", "PROCESSING", "SHIPPED"].includes(o.status)
  ).length;

  const stats = [
    {
      label: "Total Pesanan",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/dashboard/orders",
    },
    {
      label: "Pesanan Aktif",
      value: activeOrders,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/dashboard/orders",
    },
    {
      label: "Wishlist",
      value: wishlistCount,
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-50",
      href: "#",
    },
    {
      label: "Alamat Tersimpan",
      value: addressCount,
      icon: MapPin,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/dashboard/addresses",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Selamat datang, {session.user.name?.split(" ")[0] || "Pembeli"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola pesanan dan profil Anda dari sini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
          >
            <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Pesanan Terbaru
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center px-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-foreground mb-1">Belum ada pesanan</p>
            <p className="text-sm text-muted-foreground mb-6">
              Temukan produk kerajinan tangan pilihan dari pengrajin Indonesia.
            </p>
            <Link
              href="/"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                {/* Product thumbnail */}
                <div className="h-14 w-14 rounded-xl bg-primary/5 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                  {order.items[0]?.product?.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.items[0].product.photos[0]}
                      alt={order.items[0].product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-muted-foreground">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {order.items[0]?.product?.title || "Produk"}
                    {order.items.length > 1 && (
                      <span className="text-muted-foreground font-normal">
                        {" "}+{order.items.length - 1} produk lainnya
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                      statusColors[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    Rp {Number(order.grandTotal).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/addresses"
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Alamat Saya</p>
            <p className="text-xs text-muted-foreground">Kelola alamat pengiriman</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
        </Link>
        <Link
          href="/dashboard/profile"
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Profil Saya</p>
            <p className="text-xs text-muted-foreground">Update nama & password</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
        </Link>
        <Link
          href="/"
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Belanja Lagi</p>
            <p className="text-xs text-muted-foreground">Jelajahi produk baru</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
}
