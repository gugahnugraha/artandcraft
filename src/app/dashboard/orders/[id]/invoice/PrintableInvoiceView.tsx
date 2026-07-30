"use client";

import { Printer, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface PrintableInvoiceViewProps {
  order: any;
}

export default function PrintableInvoiceView({ order }: PrintableInvoiceViewProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const isPaid = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status);
  const sellerNames = Array.from(
    new Set(order.items.map((i: any) => i.product.seller.storeName))
  ).join(", ");

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4 sm:px-6">
      {/* Control Action Bar (Hidden on Print) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Pesanan
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-primary/90 transition-all shadow-md"
        >
          <Printer className="h-4 w-4" /> Cetak / Download PDF
        </button>
      </div>

      {/* Main Printable Document Sheet */}
      <div className="max-w-3xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start pb-8 border-b-2 border-slate-900">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">
              Art <span className="italic font-normal text-amber-700">and</span> Craft
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Marketplace Kerajinan Tangan & Artisan Nusantara
            </p>
            <p className="text-[11px] text-slate-400">www.artandcraft.id · support@artandcraft.id</p>
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider">FAKTUR RESMI</h2>
            <p className="font-mono text-sm font-bold text-primary mt-1">
              #{order.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tanggal: {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            {isPaid && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 mt-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> LUNAS
              </span>
            )}
          </div>
        </div>

        {/* Invoice Info Grid */}
        <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Penerima / Alamat Pengiriman:
            </span>
            <p className="font-bold text-slate-900 text-sm">{order.shippingAddress?.fullName || order.user.name}</p>
            <p className="text-slate-600">{order.shippingAddress?.phoneNumber || "-"}</p>
            <p className="text-slate-600">{order.shippingAddress?.street}</p>
            <p className="text-slate-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Informasi Pengiriman & Toko:
            </span>
            <p className="text-slate-700"><strong>Toko Pengrajin:</strong> {sellerNames}</p>
            <p className="text-slate-700"><strong>Kurir Pengiriman:</strong> {order.shippingCourier?.toUpperCase() || "-"}</p>
            <p className="text-slate-700 font-mono"><strong>Nomor Resi:</strong> {order.trackingNumber || "Belum diinput"}</p>
            <p className="text-slate-700 capitalize"><strong>Metode Bayar:</strong> {order.paymentMethod || "Midtrans Online"}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-700 font-bold uppercase tracking-wider">
                <th className="pb-3">Produk</th>
                <th className="pb-3 text-center">Jumlah</th>
                <th className="pb-3 text-right">Harga Satuan</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-3 font-semibold text-slate-900">{item.product.title}</td>
                  <td className="py-3 text-center font-mono">{item.quantity}</td>
                  <td className="py-3 text-right">Rp {item.price.toLocaleString("id-ID")}</td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="pt-4 border-t-2 border-slate-900 flex justify-end">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Produk:</span>
              <span>Rp {order.totalAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Biaya Pengiriman:</span>
              <span>Rp {order.shippingCost.toLocaleString("id-ID")}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon Kupon:</span>
                <span>- Rp {order.discountAmount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-slate-900 text-base pt-2 border-t border-slate-300">
              <span>Grand Total:</span>
              <span className="text-amber-800">Rp {order.grandTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Official Footer Guarantee */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Dokumen faktur ini diterbitkan secara sah oleh sistem Rekening Bersama Escrow ArtAndCraft.id</span>
          </div>
          <span>Halaman 1 dari 1</span>
        </div>

      </div>
    </div>
  );
}
