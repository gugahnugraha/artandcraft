import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXTAUTH_URL || "https://artandcraft.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/produk/", "/toko/", "/search"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/seller/",
          "/admin/",
          "/checkout",
          "/cart",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
