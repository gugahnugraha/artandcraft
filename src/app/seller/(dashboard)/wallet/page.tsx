"use client";

import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Building2, CreditCard, User, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";

export default function SellerWalletPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Bank form state
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);
  const [bankMsg, setBankMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/wallet");
      const result = await res.json();
      if (res.ok) {
        setData(result);
        setBankName(result.bankName || "");
        setBankAccountNumber(result.bankAccountNumber || "");
        setBankAccountHolder(result.bankAccountHolder || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingBank(true);
    setBankMsg(null);
    try {
      const res = await fetch("/api/seller/wallet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, bankAccountNumber, bankAccountHolder }),
      });
      const result = await res.json();
      if (res.ok) {
        setBankMsg({ text: "Rekening bank berhasil disimpan!", type: "success" });
        fetchWalletData();
      } else {
        setBankMsg({ text: result.error || "Gagal menyimpan data bank.", type: "error" });
      }
    } catch {
      setBankMsg({ text: "Terjadi kesalahan koneksi.", type: "error" });
    } finally {
      setIsUpdatingBank(false);
    }
  };

  const handleRequestWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWithdraw(true);
    setWithdrawMsg(null);
    try {
      const res = await fetch("/api/seller/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(withdrawAmount) }),
      });
      const result = await res.json();
      if (res.ok) {
        setWithdrawMsg({ text: "Permintaan penarikan dana berhasil diajukan!", type: "success" });
        setWithdrawAmount("");
        setWithdrawModalOpen(false);
        fetchWalletData();
      } else {
        setWithdrawMsg({ text: result.error || "Gagal mengajukan penarikan.", type: "error" });
      }
    } catch {
      setWithdrawMsg({ text: "Terjadi kesalahan jaringan.", type: "error" });
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat data dompet toko...</p>
      </div>
    );
  }

  const balance = data?.balance || 0;
  const hasBankDetails = data?.bankName && data?.bankAccountNumber && data?.bankAccountHolder;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="h-7 w-7 text-primary" /> Dompet & Saldo Toko
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola hasil penjualan pesanan dan ajukan penarikan dana ke rekening bank Anda.
        </p>
      </div>

      {/* Main Grid (Saldo Card & Bank Account Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Balance Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary via-primary/90 to-amber-700 text-primary-foreground rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">
                Saldo Penghasilan Toko
              </span>
              <Wallet className="h-6 w-6 text-white/80" />
            </div>
            
            <p className="text-xs text-white/80 mb-1">Saldo Siap Ditarik</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Rp {balance.toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="pt-6 mt-6 border-t border-white/20 flex flex-col gap-3">
            <button
              onClick={() => setWithdrawModalOpen(true)}
              disabled={balance < 50000 || !hasBankDetails}
              className="w-full rounded-xl bg-white text-primary py-3 px-4 text-sm font-bold hover:bg-white/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="h-4 w-4" />
              Tarik Dana ke Bank
            </button>
            {!hasBankDetails && (
              <p className="text-[11px] text-white/90 text-center italic">
                *Lengkapi data rekening bank di samping untuk menarik dana.
              </p>
            )}
            {hasBankDetails && balance < 50000 && (
              <p className="text-[11px] text-white/90 text-center italic">
                *Minimal penarikan dana adalah Rp 50.000.
              </p>
            )}
          </div>
        </div>

        {/* Bank Account Settings Form */}
        <div className="lg:col-span-7 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Rekening Bank Tujuan
          </h2>

          {bankMsg && (
            <div className={`p-3 rounded-lg border text-sm mb-4 flex items-center gap-2 ${
              bankMsg.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}>
              {bankMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{bankMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateBank} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Nama Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">-- Pilih Bank --</option>
                <option value="BCA">Bank BCA</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="BNI">Bank BNI</option>
                <option value="BRI">Bank BRI</option>
                <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                <option value="CIMB">CIMB Niaga</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Contoh: 1234567890"
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Nama sesuai buku tabungan"
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingBank}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isUpdatingBank ? "Menyimpan..." : "Simpan Rekening"}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* History Split (Mutasi Saldo & Riwayat Penarikan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Wallet Transactions */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-foreground flex items-center justify-between">
            <span>Mutasi Saldo</span>
            <RefreshCw className="h-4 w-4 text-muted-foreground cursor-pointer hover:rotate-180 transition-transform" onClick={fetchWalletData} />
          </h2>

          {!data?.transactions || data.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada mutasi transaksi saldo.</p>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {data.transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.type === "CREDIT" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                      {tx.type === "CREDIT" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${tx.type === "CREDIT" ? "text-green-600" : "text-destructive"}`}>
                    {tx.type === "CREDIT" ? "+" : "-"} Rp {tx.amount.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal Requests */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-foreground">Riwayat Penarikan Dana</h2>

          {!data?.withdrawals || data.withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada permintaan penarikan dana.</p>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {data.withdrawals.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background text-sm">
                  <div>
                    <p className="font-bold text-foreground text-sm">Rp {w.amount.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-muted-foreground">{w.bankName} - {w.bankAccountNumber} ({w.bankAccountHolder})</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(w.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                      w.status === "APPROVED" ? "bg-green-500/10 text-green-600" : w.status === "REJECTED" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {w.status === "APPROVED" ? "Disetujui" : w.status === "REJECTED" ? "Ditolak" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal Withdraw Request */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-xl text-foreground">Ajukan Penarikan Dana</h3>
            
            {withdrawMsg && (
              <div className={`p-3 rounded-lg border text-xs ${withdrawMsg.type === "success" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                {withdrawMsg.text}
              </div>
            )}

            <div className="p-4 rounded-xl bg-muted/40 space-y-1 text-xs">
              <p className="text-muted-foreground">Tujuan Transfer:</p>
              <p className="font-bold text-foreground text-sm">{data?.bankName} - {data?.bankAccountNumber}</p>
              <p className="text-muted-foreground">a.n. {data?.bankAccountHolder}</p>
            </div>

            <form onSubmit={handleRequestWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Jumlah Penarikan (Rp)</label>
                <input
                  type="number"
                  min={50000}
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Minimum Rp 50.000"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base font-bold text-foreground focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Maksimal penarikan: Rp {balance.toLocaleString("id-ID")}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-6 py-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingWithdraw ? "Mengirim..." : "Kirim Permintaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
