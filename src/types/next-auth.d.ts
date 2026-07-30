import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    username?: string | null;
    password?: string | null;
    emailVerified: Date | null;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      username?: string | null;
      hasPassword?: boolean;
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id: string;
    username?: string | null;
    hasPassword?: boolean;
    emailVerified: Date | null;
  }
}
