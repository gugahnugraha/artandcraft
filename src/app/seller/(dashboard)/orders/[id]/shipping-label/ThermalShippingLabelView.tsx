"use client";

import { Printer, ArrowLeft, PackageCheck, Truck, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface ThermalShippingLabelViewProps {
  order: any;
}

export default function ThermalShippingLabelView({ order }: ThermalShippingLabelViewProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const firstSeller = order.items[0]?.product?.seller;
  const totalItemsCount = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4 flex flex-col items-center">
      {/* Control Action Bar */}
      <div className="w-full max-w-[100mm] mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs hover:bg-primary/90 transition-all shadow-md"
        >
          <Printer className="h-4 w-4" /> Cetak Resi (Thermal A6)
        </button>
      </div>

      {/* Standard A6 Thermal Label Sticker (100mm x 150mm layout) */}
      <div className="w-[100mm] min-h-[145mm] bg-white text-slate-900 p-4 border-2 border-slate-900 flex flex-col justify-between print:w-[100mm] print:h-[145mm] print:m-0 print:border-2 print:border-slate-900 font-sans shadow-2xl print:shadow-none">
        
        {/* Header Logo & Courier */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900">
            <div>
              <h1 className="font-serif text-lg font-black tracking-tight text-slate-900">
                Art<span className="italic text-amber-700">and</span>Craft.id
              </h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                REKNING BERSAMA ESCROW
              </p>
            </div>

            <div className="text-right border-l-2 border-slate-900 pl-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">KURIR:</span>
              <p className="text-base font-black text-slate-900 uppercase tracking-tight">
                {order.shippingCourier || "REGULER"}
              </p>
            </div>
          </div>

          {/* Barcode & Tracking Number Section */}
          <div className="py-3 text-center border-b-2 border-slate-900 bg-slate-50">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
              NOMOR RESI PENGIRIMAN:
            </span>
            {/* Visual Barcode Simulation */}
            <div className="my-1 flex justify-center items-center h-10 space-x-0.5">
              {[...Array(38)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-slate-900 h-full ${
                    i % 3 === 0 ? "w-1" : i % 5 === 0 ? "w-1.5" : "w-0.5"
                  }`}
                />
              ))}
            </div>
            <p className="font-mono text-sm font-black text-slate-900 tracking-wider">
              {order.trackingNumber || `AC-${order.id.slice(-10).toUpperCase()}`}
            </p>
          </div>

          {/* Sender & Receiver Address Grid */}
          <div className="grid grid-cols-2 gap-2 py-3 border-b-2 border-slate-900 text-[11px] leading-tight">
            {/* SENDER */}
            <div className="pr-2 border-r border-slate-300">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                PENGIRIM (TOKO):
              </span>
              <p className="font-bold text-slate-900">{firstSeller?.storeName || "Toko Pengrajin"}</p>
              <p className="text-slate-600 text-[10px] truncate">{firstSeller?.user?.email || "-"}</p>
              <p className="text-slate-600 text-[10px]">Indonesia</p>
            </div>

            {/* RECEIVER */}
            <div className="pl-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                PENERIMA (PEMBELI):
              </span>
              <p className="font-bold text-slate-900 text-xs">{order.shippingAddress?.fullName}</p>
              <p className="text-slate-900 font-mono font-bold text-[10px]">{order.shippingAddress?.phoneNumber}</p>
              <p className="text-slate-700 text-[10px] mt-0.5">{order.shippingAddress?.street}</p>
              <p className="text-slate-800 font-bold text-[10px]">
                {order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}
              </p>
            </div>
          </div>

          {/* Packing List Manifest */}
          <div className="py-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <PackageCheck className="h-3 w-3" /> ISI PAKET ({totalItemsCount} ITEM):
              </span>
              <span className="text-[9px] font-bold font-mono text-slate-600">
                ORDER #{order.id.slice(-6).toUpperCase()}
              </span>
            </div>

            <ul className="divide-y divide-slate-200 text-[10px]">
              {order.items.map((item: any) => (
                <li key={item.id} className="py-1 flex justify-between">
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {item.product.title}
                  </span>
                  <span className="font-bold font-mono text-slate-900 shrink-0 ml-1">
                    x{item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Warning */}
        <div className="pt-2 border-t border-slate-900 text-[8px] text-center text-slate-500 space-y-0.5">
          <p className="font-bold text-slate-700">DILARANG MEMBUKA PAKET SEBELUM DITERIMA PEMBELI</p>
          <p>Wajib video unboxing untuk klaim asuransi sengketa retur barang.</p>
        </div>

      </div>
    </div>
  );
}
