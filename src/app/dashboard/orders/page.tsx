import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { Package, ShoppingBag, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pesanan Saya | ArtAndCraft.id",
};

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  AWAITING_PAYMENT: "bg-orange-100 text-orange-700 border-orange-200",
  PAID: "bg-blue-100 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu",
  AWAITING_PAYMENT: "Menunggu Bayar",
  PAID: "Dibayar",
  PROCESSING: "Sedang Diproses",
  SHIPPED: "Dalam Pengiriman",
  DELIVERED: "Pesanan Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: { title: true, photos: true, slug: true },
          },
        },
      },
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Pesanan Saya</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {orders.length} pesanan ditemukan
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm py-20 flex flex-col items-center text-center px-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h2 className="font-serif text-xl font-bold text-foreground mb-2">
            Belum Ada Pesanan
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Mulai berbelanja produk kerajinan tangan dari pengrajin UMKM lokal Indonesia.
          </p>
          <Link
            href="/"
            className="rounded-full bg-primary px-8 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Temukan Produk
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono font-semibold text-foreground">
                    #{order.id.substring(0, 12).toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    statusColors[order.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="px-5 py-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-muted border border-border overflow-hidden shrink-0">
                      {item.product?.photos?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.photos[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.product?.title || "Produk"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    {item.product?.slug && (
                      <Link
                        href={`/produk/${item.product.slug}`}
                        className="text-xs font-semibold text-primary hover:underline shrink-0 flex items-center gap-0.5"
                      >
                        Lihat <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="px-5 py-3.5 border-t border-border flex items-center justify-between bg-muted/20">
                <div className="text-xs text-muted-foreground">
                  {order.shippingAddress && (
                    <span>
                      Ke: {order.shippingAddress.city},{" "}
                      {order.shippingAddress.province}
                    </span>
                  )}
                  {order.trackingNumber && (
                    <span className="ml-3 font-mono text-foreground">
                      Resi: {order.trackingNumber}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-base font-bold text-foreground">
                      Rp {Number(order.grandTotal).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
                  >
                    Detail <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
