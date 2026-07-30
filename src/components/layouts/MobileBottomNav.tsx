"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ShoppingBag, Heart, User } from "lucide-react";
import { useCart } from "@/store/cart";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { useLanguage } from "@/contexts/LanguageContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();
  const totalCartCount = useCart((state: any) => state.getTotalItems());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hide on invoice or thermal shipping label pages
  if (pathname.includes("/invoice") || pathname.includes("/shipping-label")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: t.mobile_nav.home, icon: Home },
    { href: "/search", label: t.mobile_nav.explore, icon: Compass },
    { href: "/cart", label: t.mobile_nav.cart, icon: ShoppingBag, badge: isMounted ? totalCartCount : 0 },
    { href: session?.user ? "/dashboard/wishlist" : "/login", label: t.mobile_nav.wishlist, icon: Heart },
    {
      href: session?.user
        ? session.user.role === "SELLER"
          ? "/seller"
          : session.user.role === "ADMIN"
          ? "/admin"
          : "/dashboard"
        : "/login",
      label: session?.user ? t.mobile_nav.account : t.mobile_nav.login,
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border/80 md:hidden px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all">
      <div className="flex items-center justify-around">
        {navLinks.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all ${
                isActive
                  ? "text-primary font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary text-[9px] font-extrabold text-primary-foreground px-1 shadow-sm">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight line-clamp-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
