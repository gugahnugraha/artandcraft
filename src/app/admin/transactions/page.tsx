import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { CreditCard, Search, Filter } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { id as idDict } from "@/locales/id";
import { en } from "@/locales/en";

export const dynamic = "force-dynamic";

interface TransactionsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

export default async function AdminTransactionsPage({ searchParams }: TransactionsPageProps) {
  const { q, status } = await searchParams;

  const where: any = {};

  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const t = lang === "en" ? en : idDict;

  const statusOptions = [
    { label: t.admin.all_status, value: "ALL" },
    { label: t.seller_orders.status_awaiting, value: "AWAITING_PAYMENT" },
    { label: t.seller_orders.status_paid, value: "PAID" },
    { label: t.seller_orders.status_processing, value: "PROCESSING" },
    { label: t.seller_orders.status_shipped, value: "SHIPPED" },
    { label: t.seller_orders.status_completed, value: "DELIVERED" },
    { label: t.order_status.CANCELLED, value: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" /> {t.admin.trx_history}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.admin.trx_history_desc}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border/50">
        
        {/* Search form */}
        <form action="/admin/transactions" method="GET" className="relative w-full sm:max-w-xs">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder={t.admin.search_placeholder}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </form>

        {/* Status Filters */}
        <form action="/admin/transactions" method="GET" className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          {q && <input type="hidden" name="q" value={q} />}
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            name="status"
            defaultValue={status || "ALL"}
            className="rounded-lg border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all w-full sm:w-auto"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {t.admin.filter}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              {t.admin.no_match}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">{t.admin.col_id}</th>
                  <th className="p-4">{t.admin.col_buyer}</th>
                  <th className="p-4">{t.admin.col_total}</th>
                  <th className="p-4">{t.admin.col_payment_status}</th>
                  <th className="p-4">{t.admin.col_trx_date}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusColors: Record<string, string> = {
                    AWAITING_PAYMENT: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                    PAID: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400",
                    PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
                    SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400",
                    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
                  };

                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/10 last:border-0">
                      <td className="p-4 font-mono text-xs font-bold text-foreground">
                        {order.id}
                      </td>
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
                        {format(new Date(order.createdAt), "d MMMM yyyy HH:mm", { locale: lang === "en" ? enUS : idLocale })}
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
