import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | ArtAndCraft.id",
};

const adminLinks = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manajemen Pengguna", icon: Users },
  { href: "/admin/transactions", label: "Transaksi", icon: CreditCard },
  { href: "/admin/withdrawals", label: "Penarikan Saldo", icon: Wallet },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Top Breadcrumb Bar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Beranda
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-semibold flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Admin Control Panel
        </span>
      </div>

      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Admin profile snippet */}
              <div className="p-5 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-serif font-bold text-lg flex items-center justify-center shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">
                      {user?.name || "Administrator"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold tracking-widest uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      SUPER ADMIN
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation links */}
              <nav className="p-2 space-y-0.5">
                {adminLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Area */}
          <main className="lg:col-span-9">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
