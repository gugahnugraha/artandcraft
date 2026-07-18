import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Star, Store, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Wishlist Saya | ArtAndCraft.id",
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/wishlist");

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              seller: {
                select: { storeName: true, storeSlug: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const items = wishlist?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary" /> Wishlist Saya
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Koleksi produk karya pengrajin lokal yang Anda simpan.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Wishlist Masih Kosong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Anda belum menambahkan produk apapun ke wishlist. Temukan karya seni dan kerajinan favorit Anda sekarang.
          </p>
          <Link
            href="/search"
            className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const p = item.product;
            const price = Number(p.price);
            const discount = Number(p.discount);
            const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

            return (
              <div key={item.id} className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
                <div className="aspect-square w-full overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.photos[0] || "/placeholder.jpg"}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 rounded-md bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground shadow-sm">
                      -{discount}%
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <Link href={`/toko/${p.seller.storeSlug}`} className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 line-clamp-1">
                      <Store className="h-3 w-3 shrink-0" />
                      {p.seller.storeName}
                    </Link>
                  </div>

                  <Link href={`/produk/${p.slug}`} className="font-bold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors mb-2">
                    {p.title}
                  </Link>

                  <div className="mt-auto">
                    <div className="font-bold text-lg text-primary">
                      Rp {finalPrice.toLocaleString("id-ID")}
                    </div>
                    {discount > 0 && (
                      <div className="text-xs text-muted-foreground line-through">
                        Rp {price.toLocaleString("id-ID")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove from wishlist action - using a client-side wrapper is better here but for simplicity we can use standard Link for now or a form. Actually let's just make the user go to product page to remove it, or we could add a client component wrapper for the card, but let's keep it simple server component. */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
