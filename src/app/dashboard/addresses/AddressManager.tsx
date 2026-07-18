"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Trash2, CheckCircle2, Edit2, X, Loader2 } from "lucide-react";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressCardProps {
  address: Address;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const PROVINCES = [
  "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta",
  "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur",
  "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah",
  "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
  "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat",
  "Papua Barat Daya", "Papua Pegunungan", "Papua Selatan", "Papua Tengah",
  "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah",
  "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan",
  "Sumatera Utara",
];

function AddressCard({ address, onDelete, onSetDefault }: AddressCardProps) {
  const [deleting, startDelete] = useTransition();
  const [setting, startSet] = useTransition();

  return (
    <div className={`bg-card rounded-2xl border shadow-sm p-5 relative transition-all ${
      address.isDefault ? "border-primary/40 shadow-primary/5 shadow-md" : "border-border"
    }`}>
      {address.isDefault && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="h-3 w-3" /> Utama
        </span>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
          <MapPin className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-foreground text-sm">{address.fullName}</p>
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
              {address.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{address.phoneNumber}</p>
        </div>
      </div>

      <p className="text-sm text-foreground leading-relaxed">
        {address.street}, {address.city}, {address.province} {address.postalCode}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{address.country}</p>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        {!address.isDefault && (
          <button
            onClick={() => startSet(() => onSetDefault(address.id))}
            disabled={setting}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            {setting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
            Jadikan Utama
          </button>
        )}
        <button
          onClick={() => startDelete(() => onDelete(address.id))}
          disabled={deleting}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors ml-auto"
        >
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Hapus
        </button>
      </div>
    </div>
  );
}

interface AddressManagerProps {
  initialAddresses: Address[];
}

export default function AddressManager({ initialAddresses }: AddressManagerProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    label: "Rumah",
    fullName: "",
    phoneNumber: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await fetch(`/api/user/addresses/${id}/default`, { method: "PATCH" });
    if (res.ok) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      router.refresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startSave(async () => {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) => [...prev, data.address]);
        setShowForm(false);
        setForm({ label: "Rumah", fullName: "", phoneNumber: "", street: "", city: "", province: "", postalCode: "" });
        router.refresh();
      } else {
        setError(data.message || "Gagal menyimpan alamat.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Alamat Tersimpan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {addresses.length} alamat tersimpan
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Batal" : "Tambah Alamat"}
        </button>
      </div>

      {/* Add Address Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-primary/30 shadow-md p-6 space-y-4">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> Tambah Alamat Baru
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["Rumah", "Kantor", "Kos", "Lainnya"].map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setForm((p) => ({ ...p, label: lbl }))}
                className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                  form.label === lbl
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Penerima</label>
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder="Nama lengkap penerima"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">No. Telepon</label>
              <input
                required
                value={form.phoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alamat Lengkap (Jalan, RT/RW, Kelurahan)</label>
            <textarea
              required
              rows={2}
              value={form.street}
              onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
              placeholder="Jl. Merdeka No. 1, RT 01/RW 02, Kel. Sukamaju"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kota / Kabupaten</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder="Bandung"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Provinsi</label>
              <select
                required
                value={form.province}
                onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              >
                <option value="">Pilih Provinsi</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kode Pos</label>
              <input
                required
                value={form.postalCode}
                onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder="40115"
                maxLength={5}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              Simpan Alamat
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Address Cards */}
      {addresses.length === 0 && !showForm ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm py-16 flex flex-col items-center text-center px-4">
          <MapPin className="h-14 w-14 text-muted-foreground/20 mb-4" />
          <p className="font-semibold text-foreground mb-1">Belum ada alamat tersimpan</p>
          <p className="text-sm text-muted-foreground mb-4">Tambahkan alamat pengiriman untuk mempercepat proses checkout.</p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Tambah Alamat Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
}
