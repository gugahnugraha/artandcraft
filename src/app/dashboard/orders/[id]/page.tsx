import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Package,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  CreditCard,
  ChevronLeft,
  CircleDot,
  CircleCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Detail Pesanan #${id.slice(-8).toUpperCase()} | ArtAndCraft.id`,
  };
}

// ─── Status pipeline ──────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "AWAITING_PAYMENT", label: "Menunggu Pembayaran", icon: CreditCard },
  { key: "PAID", label: "Pembayaran Diterima", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Sedang Dikemas", icon: Package },
  { key: "SHIPPED", label: "Dalam Pengiriman", icon: Truck },
  { key: "DELIVERED", label: "Pesanan Diterima", icon: CheckCircle2 },
];

const STATUS_ORDER = ["AWAITING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

function getStepIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

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

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/dashboard/orders/${id}`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      shippingAddress: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              photos: true,
              slug: true,
              seller: { select: { storeName: true, storeSlug: true } },
            },
          },
        },
      },
      tracking: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order || order.userId !== session.user.id) notFound();

  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Pesanan Saya
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">
              Pesanan #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Dipesan pada{" "}
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-semibold border ${
              statusColors[order.status] || "bg-muted text-muted-foreground border-border"
            }`}
          >
            {statusLabels[order.status] || order.status}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Status Pesanan
          </h2>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />

            <ol className="space-y-5 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <li key={step.key} className="flex items-start gap-4 pl-1">
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CircleCheck className="h-4 w-4" />
                      ) : (
                        <CircleDot className="h-4 w-4" />
                      )}
                    </div>
                    <div className="pt-0.5 flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Saat ini
                          </span>
                        )}
                      </p>
                      {step.key === "SHIPPED" && order.trackingNumber && isCompleted && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Nomor Resi:{" "}
                          <span className="font-mono font-semibold text-foreground">
                            {order.trackingNumber}
                          </span>
                          {order.shippingCourier && (
                            <span className="ml-2 uppercase text-primary font-bold">
                              {order.shippingCourier}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Confirm receipt button */}
          {order.status === "SHIPPED" && (
            <form action={`/api/orders/${order.id}/confirm`} method="POST" className="mt-6">
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Konfirmasi Pesanan Diterima
              </button>
            </form>
          )}
        </div>
      )}

      {/* Order Items */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Item Pesanan ({order.items.length} produk)
          </h2>
        </div>
        <div className="divide-y divide-border/60">
          {order.items.map((item) => {
            const photo = item.product.photos?.[0] || null;
            return (
              <div key={item.id} className="flex gap-4 p-5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted border border-border">
                  {photo ? (
                    <img
                      src={photo}
                      alt={item.product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produk/${item.product.slug}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.product.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Toko:{" "}
                    <Link
                      href={`/toko/${item.product.seller.storeSlug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {item.product.seller.storeName}
                    </Link>
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {item.quantity} × {formatRupiah(Number(item.price))}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatRupiah(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two column: Shipping + Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              Alamat Pengiriman
            </h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phoneNumber}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
            {order.shippingCourier && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Kurir:{" "}
                  <span className="font-semibold text-foreground uppercase">
                    {order.shippingCourier}
                  </span>
                </p>
                {order.trackingNumber && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Nomor Resi:{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {order.trackingNumber}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-primary" />
            Ringkasan Pembayaran
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatRupiah(Number(order.totalAmount))}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkos Kirim</span>
              <span>{formatRupiah(Number(order.shippingCost))}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon</span>
                <span>- {formatRupiah(Number(order.discountAmount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border/60">
              <span>Total</span>
              <span className="text-primary">{formatRupiah(Number(order.grandTotal))}</span>
            </div>
          </div>
          {order.paymentMethod && (
            <p className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
              Metode Bayar: <span className="font-semibold text-foreground capitalize">{order.paymentMethod}</span>
            </p>
          )}
          {order.paymentInvoice && (
            <p className="text-xs text-muted-foreground mt-1">
              ID Transaksi:{" "}
              <span className="font-mono font-semibold text-foreground">{order.paymentInvoice}</span>
            </p>
          )}
        </div>
      </div>

      {/* Buyer Notes */}
      {order.notes && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-2 text-sm">Catatan untuk Penjual</h2>
          <p className="text-sm text-muted-foreground italic">"{order.notes}"</p>
        </div>
      )}
    </div>
  );
}
