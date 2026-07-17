import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Assign the NextAuth handler directly to the named export "proxy"
export const proxy: any = auth;

export const config = {
  // Protect specific directories and handle authentication redirects
  matcher: ["/login", "/register", "/admin/:path*", "/seller/:path*", "/profile/:path*"],
};
