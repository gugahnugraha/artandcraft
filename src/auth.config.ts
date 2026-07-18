import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Populated in auth.ts to avoid Edge compilation issues with database drivers
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnSeller = nextUrl.pathname.startsWith("/seller");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnAuth = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

      if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isOnAdmin) {
        return isLoggedIn && auth.user?.role === "ADMIN";
      }

      if (isOnSeller) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
