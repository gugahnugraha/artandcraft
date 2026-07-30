import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Assign the NextAuth handler directly to the named export "proxy"
export const proxy: any = auth;

export const config = {
  // Protect routes and handle forced setup-account redirects on all page navigations
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
