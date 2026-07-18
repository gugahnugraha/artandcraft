import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProductFormClient from "../../new/ProductFormClient";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Get seller profile
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!sellerProfile) {
    redirect("/seller/setup");
  }

  // Fetch product
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  // Verify ownership
  if (product.sellerId !== sellerProfile.id) {
    redirect("/seller/products");
  }

  // Get categories and subcategories
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true,
    },
    orderBy: { name: "asc" },
  });

  // Serialize product decimal fields
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    discount: Number(product.discount),
  };

  return (
    <div className="flex-1 bg-accent/10 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Produk</span>
          </Link>
        </div>

        {/* Title Block */}
        <div className="border-b border-border/40 pb-6 mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Edit Karya Anda
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Perbarui detail informasi kerajinan tangan Anda di bawah ini.
          </p>
        </div>

        {/* Client Form Component */}
        <ProductFormClient categories={categories} initialProduct={serializedProduct} />

      </div>
    </div>
  );
}
