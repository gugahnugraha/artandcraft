"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-border/30 bg-muted/30 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <span className="font-serif text-2xl font-light text-foreground tracking-tight">
                Art <span className="italic font-normal">and</span> Craft
              </span>
            </Link>
            <p className="text-sm font-light leading-relaxed max-w-xs text-muted-foreground">
              {t.footer.description}
            </p>
            <div className="mt-6 text-xs font-medium text-primary">
              🇮🇩 {t.footer.rights}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: t.header.category,
              links: ["Batik", "Woodcraft", "Ceramics", "Macrame", "Jewelry"],
              href: "/search",
            },
            {
              title: t.header.artisan,
              links: [t.home.become_seller_btn, t.header.store_dashboard],
              href: "/seller/setup",
            },
            {
              title: "Info",
              links: [t.footer.about, t.footer.contact],
              href: "#",
            },
          ].map(({ title, links, href }) => (
            <div key={title}>
              <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60 mb-5">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((item) => (
                  <li key={item}>
                    <Link href={href} className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light text-muted-foreground/60">
          <div>© {new Date().getFullYear()} Art and Craft — {t.footer.rights}</div>
          <div className="flex gap-6">
            {[t.footer.privacy, t.footer.terms].map((item) => (
              <Link key={item} href="#" className="hover:text-muted-foreground transition-colors">{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
