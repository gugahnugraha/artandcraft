import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CreditCard,
  Users,
  Store,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Fetch metrics
  const totalUsers = await prisma.user.count();
  const totalStores = await prisma.sellerProfile.count();
  const totalOrders = await prisma.order.count();

  // Get total GMV (Gross Merchandise Value) from PAID / PROCESSING / SHIPPED orders
  const paidOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PAID", "PROCESSING", "SHIPPED"],
      },
    },
    select: {
      totalAmount: true,
    },
  });
  
  const gmv = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  // 2. Fetch 5 recent orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  const stats = [
    {
      label: "Gross Merchandise Value",
      value: `Rp ${gmv.toLocaleString("id-ID")}`,
      desc: "Total transaksi sukses terbayar",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      label: "Total Pengguna",
      value: totalUsers.toString(),
      desc: "Pembeli, penjual & administrator",
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: "Toko Pengrajin",
      value: totalStores.toString(),
      desc: "UMKM terdaftar di platform",
      icon: Store,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      label: "Total Pesanan",
      value: totalOrders.toString(),
      desc: "Semua pesanan (berbayar/belum)",
      icon: CreditCard,
      color: "text-violet-600 bg-violet-100 dark:bg-violet-950/40 dark:text-violet-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Ringkasan Platform</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau status kesehatan platform dan transaksi teraktual.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
              <div className={`p-3 rounded-xl ${stat.color} shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <h3 className="font-serif text-2xl font-black text-foreground mt-1 tracking-tight">{stat.value}</h3>
                <p className="text-xs text-muted-foreground mt-1.5">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Transaksi Terbaru
          </h2>
          <Link href="/admin/transactions" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Lihat semua <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Belum ada pesanan masuk di platform.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">ID Order</th>
                  <th className="p-4">Pembeli</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const statusColors: Record<string, string> = {
                    AWAITING_PAYMENT: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                    PAID: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400",
                    PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                    SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400",
                    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
                  };

                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/10 last:border-0">
                      <td className="p-4 font-mono text-xs font-bold text-foreground">{order.id.slice(0, 8)}...</td>
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{order.user.name || "User"}</div>
                        <div className="text-xs text-muted-foreground">{order.user.email}</div>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${statusColors[order.status] || "bg-neutral-100 text-neutral-800"}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), "d MMMM yyyy HH:mm", { locale: id })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
