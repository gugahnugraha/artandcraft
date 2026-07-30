import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [], // Populated in auth.ts to avoid Edge compilation issues with database drivers
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id ?? "";
        token.username = user.username ?? null;
        token.hasPassword = !!user.password;
        token.emailVerified = user.emailVerified;
      }
      
      // Handle active session updates (e.g. role upgraded to SELLER or setup-account completed)
      if (trigger === "update" && session?.user) {
        if (session.user.role) token.role = session.user.role;
        if (session.user.username !== undefined) token.username = session.user.username;
        if (session.user.hasPassword !== undefined) token.hasPassword = session.user.hasPassword;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
        session.user.hasPassword = token.hasPassword as boolean;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isOnSetupAccount = pathname.startsWith("/setup-account");
      const isOnAuth = pathname.startsWith("/login") || pathname.startsWith("/register");
      const isOnApi = pathname.startsWith("/api");
      const isOnSeller = pathname.startsWith("/seller");
      const isOnAdmin = pathname.startsWith("/admin");

      // Forced onboarding check for Google OAuth users without username or password
      if (isLoggedIn && (!auth.user?.username || !auth.user?.hasPassword)) {
        if (!isOnSetupAccount && !isOnApi && !isOnAuth) {
          return Response.redirect(new URL("/setup-account", nextUrl));
        }
        return true;
      }

      if (isOnSetupAccount) {
        if (!isLoggedIn || (auth.user?.username && auth.user?.hasPassword)) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

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
