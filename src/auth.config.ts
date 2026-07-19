import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export const authConfig = {
  providers: [], // Populated in auth.ts to avoid Edge compilation issues with database drivers
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id ?? "";
        token.emailVerified = user.emailVerified;
      }
      
      // Handle active session updates (e.g. role upgraded to SELLER)
      if (trigger === "update" && session?.user) {
        token.role = session.user.role;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
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
