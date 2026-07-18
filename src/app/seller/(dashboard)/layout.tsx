import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Store, Tag, MessageSquare, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    redirect("/seller/setup");
  }

  // Fetch Seller Profile to display store name
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!sellerProfile) {
    redirect("/seller/setup");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex shrink-0">
        
        {/* Brand & Store Name */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="font-serif text-xl font-bold text-primary flex items-center gap-2">
            <Store className="h-5 w-5" />
            <span>Art and Craft</span>
          </Link>
        </div>
        
        <div className="p-4 border-b border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Toko Anda</p>
          <p className="text-sm font-bold text-foreground truncate">{sellerProfile.storeName}</p>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <Link 
            href="/seller" 
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="h-4.5 w-4.5 text-muted-foreground" />
            Dashboard
          </Link>
          <Link 
            href="/seller/products" 
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Package className="h-4.5 w-4.5 text-muted-foreground" />
            Produk Saya
          </Link>
          <Link 
            href="/seller/orders" 
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors relative"
          >
            <ShoppingCart className="h-4.5 w-4.5 text-muted-foreground" />
            Pesanan Masuk
            <span className="absolute right-3 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
              Baru
            </span>
          </Link>
          <Link 
            href="/seller/coupons" 
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Tag className="h-4.5 w-4.5 text-muted-foreground" />
            Kupon & Promo
          </Link>
          <Link 
            href="/seller/messages" 
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <MessageSquare className="h-4.5 w-4.5 text-muted-foreground" />
            Pesan Masuk
          </Link>
          <Link 
            href="/seller/wallet" 
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Wallet className="h-4.5 w-4.5 text-muted-foreground" />
            Dompet & Saldo
          </Link>
          <Link 
            href="/seller/settings" 
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="h-4.5 w-4.5 text-muted-foreground" />
            Pengaturan Toko
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-border">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <LogOut className="h-4.5 w-4.5" />
            Kembali ke Marketplace
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-muted/20">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <span className="font-serif font-bold text-foreground truncate">{sellerProfile.storeName}</span>
          <Link href="/" className="text-xs font-semibold text-primary">Tutup</Link>
        </div>

        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>

      </main>

    </div>
  );
}
