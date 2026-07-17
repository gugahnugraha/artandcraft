import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Falls back to a local string during post-install/build steps on Vercel
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/artandcraft?schema=public",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
