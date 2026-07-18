import { prisma } from "@/lib/prisma";
import UsersTableClient from "./UsersTableClient";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      sellerProfile: {
        select: {
          storeName: true,
          storeSlug: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" /> Manajemen Pengguna
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lihat daftar semua pengguna terdaftar dan kelola hak akses mereka.
        </p>
      </div>

      <UsersTableClient initialUsers={users} />
    </div>
  );
}
