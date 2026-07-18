import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Package, Clock, CheckCircle2, Truck, AlertCircle } from "lucide-react";
import Link from "next/link";
import OrderStatusUpdater from "./OrderStatusUpdater";

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!sellerProfile) return null;

  // Find all distinct orders that have items belonging to this seller
  const relevantOrderItems = await prisma.orderItem.findMany({
    where: {
      product: { sellerId: sellerProfile.id }
    },
    include: {
      order: {
        include: {
          shippingAddress: true,
          user: { select: { name: true, email: true } }
        }
      },
      product: { select: { title: true, photos: true } }
    },
    orderBy: {
      order: { createdAt: 'desc' }
    }
  });

  // Group by order ID because a single order might have multiple items from this seller
  const ordersMap = new Map();
  
  relevantOrderItems.forEach(item => {
    if (!ordersMap.has(item.orderId)) {
      ordersMap.set(item.orderId, {
        orderInfo: item.order,
        items: []
      });
    }
    ordersMap.get(item.orderId).items.push(item);
  });

  const groupedOrders = Array.from(ordersMap.values());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AWAITING_PAYMENT":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600"><Clock className="h-3.5 w-3.5" /> Menunggu Pembayaran</span>;
      case "PAID":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600"><CheckCircle2 className="h-3.5 w-3.5" /> Sudah Dibayar (Perlu Diproses)</span>;
      case "PROCESSING":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600"><Package className="h-3.5 w-3.5" /> Sedang Diproses</span>;
      case "SHIPPED":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600"><Truck className="h-3.5 w-3.5" /> Sedang Dikirim</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Pesanan Masuk</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola dan proses pesanan dari pelanggan Anda.
          </p>
        </div>
      </div>

      {groupedOrders.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Belum ada pesanan</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Produk Anda belum memiliki pesanan. Tetap semangat, pastikan foto produk Anda menarik dan bagikan *link* toko Anda ke media sosial!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedOrders.map((group: any) => {
            const { orderInfo, items } = group;
            
            // Calculate total revenue for THIS seller only (in case order has mixed seller items)
            const sellerTotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);

            return (
              <div key={orderInfo.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Header Card */}
                <div className="bg-muted/30 px-6 py-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                        #{orderInfo.id.slice(-8)}
                      </span>
                      {getStatusBadge(orderInfo.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dipesan pada: {new Date(orderInfo.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground mb-1">Total Pendapatan Anda</p>
                    <p className="font-bold text-foreground text-lg">Rp {sellerTotal.toLocaleString("id-ID")}</p>
                  </div>
                </div>

                {/* Body Card */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Items List */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">Daftar Produk</h3>
                    {items.map((item: any) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="h-16 w-16 rounded-lg bg-accent shrink-0 overflow-hidden border border-border">
                          {item.product.photos[0] ? (
                            <img src={item.product.photos[0]} alt={item.product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground line-clamp-1">{item.product.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Info & Actions */}
                  <div className="space-y-4 md:border-l md:border-border/50 md:pl-6">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">Info Pengiriman</h3>
                    {orderInfo.shippingAddress ? (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-semibold text-foreground">{orderInfo.shippingAddress.fullName}</p>
                        <p>{orderInfo.shippingAddress.phoneNumber}</p>
                        <p className="line-clamp-2">{orderInfo.shippingAddress.street}</p>
                        <p>{orderInfo.shippingAddress.city}, {orderInfo.shippingAddress.province}</p>
                        <p>{orderInfo.shippingAddress.postalCode}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Alamat tidak ditemukan
                      </p>
                    )}

                    <div className="pt-4 mt-4 border-t border-border/50">
                      <OrderStatusUpdater orderId={orderInfo.id} currentStatus={orderInfo.status} />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
