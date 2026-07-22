import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductFormClient from "./ProductFormClient";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { id } from "@/locales/id";
import { en } from "@/locales/en";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Get categories and subcategories
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true,
    },
    orderBy: { name: "asc" },
  });

  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const t = lang === "en" ? en : id;

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
            <span>{t.seller_products.back_to_list}</span>
          </Link>
        </div>

        {/* Title Block */}
        <div className="border-b border-border/40 pb-6 mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            {t.seller_products.upload_new}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {t.seller_products.upload_new_desc}
          </p>
        </div>

        {/* Client Form Component */}
        <ProductFormClient categories={categories} />

      </div>
    </div>
  );
}
