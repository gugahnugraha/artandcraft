"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Shield, User, Store, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Role } from "@prisma/client";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date | string;
  sellerProfile: {
    storeName: string;
    storeSlug: string;
  } | null;
}

export default function UsersTableClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah hak akses pengguna ini menjadi ${newRole}?`)) return;

    setUpdatingId(userId);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        setError(data.message || "Gagal memperbarui hak akses.");
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.sellerProfile?.storeName && u.sellerProfile.storeName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border/50">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Cari nama, email, atau toko..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all w-full sm:w-auto"
          >
            <option value="ALL">Semua Role</option>
            <option value="BUYER">Pembeli (BUYER)</option>
            <option value="SELLER">Penjual (SELLER)</option>
            <option value="ADMIN">Admin (ADMIN)</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              Tidak ada pengguna ditemukan.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Nama & Email</th>
                  <th className="p-4">Role Saat Ini</th>
                  <th className="p-4">Info Toko</th>
                  <th className="p-4">Tanggal Gabung</th>
                  <th className="p-4 text-right">Ubah Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const roleBadges: Record<Role, string> = {
                    GUEST: "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200",
                    BUYER: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
                    SELLER: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
                    ADMIN: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
                  };

                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/10 last:border-0">
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{u.name || "Pengguna"}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${roleBadges[u.role]}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.sellerProfile ? (
                          <div className="text-xs font-semibold text-primary">
                            {u.sellerProfile.storeName}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {format(new Date(u.createdAt), "d MMMM yyyy", { locale: id })}
                      </td>
                      <td className="p-4 text-right">
                        {updatingId === u.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                            className="rounded-lg border border-border bg-background py-1 px-2.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="BUYER">BUYER</option>
                            <option value="SELLER">SELLER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
