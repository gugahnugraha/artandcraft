import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  LayoutDashboard, Package, MapPin, User,
  ArrowLeft, ChevronRight, Heart
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Pesanan Saya", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist Saya", icon: Heart },
  { href: "/dashboard/addresses", label: "Alamat Tersimpan", icon: MapPin },
  { href: "/dashboard/profile", label: "Profil & Keamanan", icon: User },
];

export default async function BuyerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top breadcrumb bar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Beranda
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">Dashboard Pembeli</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* User info */}
              <div className="p-5 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-serif font-bold text-xl flex items-center justify-center shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">
                      {user?.name || "Pengguna"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Pembeli
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {navLinks.map(({ href, label, icon: Icon }) => (
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

              <div className="p-3 border-t border-border">
                <Link
                  href="/seller/setup"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary/10 text-primary px-3 py-2.5 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  Buka Toko Saya
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
