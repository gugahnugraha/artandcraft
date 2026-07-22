import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Plus, LayoutDashboard, ShoppingBag, Store } from "lucide-react";
import ProductListClient from "./ProductListClient";
import { redirect } from "next/navigation";
import { ProductStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { id } from "@/locales/id";
import { en } from "@/locales/en";

export const dynamic = "force-dynamic";

export default async function SellerProductsPage() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Get the seller profile
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!sellerProfile) {
    // If they have no seller profile, they need to onboard first
    redirect("/seller/setup");
  }

  // Get all products for this seller
  const products = await prisma.product.findMany({
    where: { sellerId: sellerProfile.id },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert Decimal fields to numbers for serialize check in Next.js props
  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    discount: Number(p.discount),
  }));

  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const t = lang === "en" ? en : id;

  return (
    <div className="flex-1 bg-accent/10 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs / Quick Info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-primary" />
              {t.seller_products.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <Store className="h-4 w-4 text-primary" />
              {t.seller_products.store} <span className="font-semibold text-foreground">{sellerProfile.storeName}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/seller"
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{t.seller_products.dashboard}</span>
            </Link>
            <Link
              href="/seller/products/new"
              className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>{t.seller_products.add_product}</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Client Table list */}
        <ProductListClient initialProducts={serializedProducts} />

      </div>
    </div>
  );
}
