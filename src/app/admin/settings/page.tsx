"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Loader2, 
  CheckCircle, 
  Eye, 
  X, 
  ArrowUp, 
  ArrowDown,
  Sparkles,
  Info
} from "lucide-react";
import ImageDropzone from "@/components/ui/ImageDropzone";

interface HeroSlide {
  id: string;
  tagId: string;
  tagEn: string;
  titleId: string;
  titleEn: string;
  subtitleId: string;
  subtitleEn: string;
  imageUrl: string;
  btnTextId: string;
  btnTextEn: string;
  btnLink: string;
  order: number;
  isActive: boolean;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "slides">("general");
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [configs, setConfigs] = useState<Record<string, string>>({
    site_name: "ArtAndCraft.id",
    primary_color: "#0DA9BA",
    announcement_enabled: "false",
    announcement_text_id: "",
    announcement_text_en: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Slide Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    tagId: "",
    tagEn: "",
    titleId: "",
    titleEn: "",
    subtitleId: "",
    subtitleEn: "",
    imageUrl: "",
    btnTextId: "",
    btnTextEn: "",
    btnLink: "",
    order: 0,
    isActive: true,
  });

  const [formLangTab, setFormLangTab] = useState<"id" | "en">("id");
  const [isTranslating, setIsTranslating] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [slidesRes, configsRes] = await Promise.all([
        fetch("/api/admin/settings/slides"),
        fetch("/api/admin/settings/config"),
      ]);

      const slidesData = await slidesRes.json();
      const configsData = await configsRes.json();

      if (slidesRes.ok) {
        setSlides(slidesData.slides || []);
      }
      if (configsRes.ok) {
        setConfigs((prev) => ({ ...prev, ...configsData.configs }));
      }
    } catch (error) {
      console.error("Error fetching admin settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfigs = async () => {
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/settings/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: configs }),
      });
      if (res.ok) {
        setSuccessMsg("Pengaturan umum berhasil disimpan!");
        // Dynamically update UI theme variables in layout without reloading
        document.documentElement.style.setProperty("--primary", configs.primary_color);
        document.documentElement.style.setProperty("--ring", configs.primary_color);
        localStorage.setItem("primary_color", configs.primary_color);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSlide(null);
    setFormData({
      tagId: "",
      tagEn: "",
      titleId: "",
      titleEn: "",
      subtitleId: "",
      subtitleEn: "",
      imageUrl: "/hero_banner.png",
      btnTextId: "Jelajahi Sekarang",
      btnTextEn: "Explore Now",
      btnLink: "/search",
      order: slides.length,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      tagId: slide.tagId,
      tagEn: slide.tagEn,
      titleId: slide.titleId,
      titleEn: slide.titleEn,
      subtitleId: slide.subtitleId,
      subtitleEn: slide.subtitleEn,
      imageUrl: slide.imageUrl,
      btnTextId: slide.btnTextId,
      btnTextEn: slide.btnTextEn,
      btnLink: slide.btnLink,
      order: slide.order,
      isActive: slide.isActive,
    });
    setIsModalOpen(true);
  };

  const translateText = async (text: string): Promise<string> => {
    if (!text || !text.trim()) return "";
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`
      );
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
      return text;
    } catch (err) {
      console.error("Translation API error:", err);
      return text;
    }
  };

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    try {
      const [translatedTag, translatedTitle, translatedSubtitle, translatedBtnText] = await Promise.all([
        translateText(formData.tagId),
        translateText(formData.titleId),
        translateText(formData.subtitleId),
        translateText(formData.btnTextId),
      ]);

      setFormData((prev) => ({
        ...prev,
        tagEn: translatedTag || prev.tagEn,
        titleEn: translatedTitle || prev.titleEn,
        subtitleEn: translatedSubtitle || prev.subtitleEn,
        btnTextEn: translatedBtnText || prev.btnTextEn,
      }));
    } catch (err) {
      console.error("Auto translation failed:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingSlide 
        ? `/api/admin/settings/slides/${editingSlide.id}`
        : "/api/admin/settings/slides";
      const method = editingSlide ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setSuccessMsg(editingSlide ? "Slide hero berhasil diperbarui!" : "Slide hero baru berhasil dibuat!");
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus slide hero ini?")) return;
    try {
      const res = await fetch(`/api/admin/settings/slides/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccessMsg("Slide hero berhasil dihapus!");
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const list = [...slides];
    const current = list[index];
    const target = list[targetIndex];

    // Swap orders
    const tempOrder = current.order;
    current.order = target.order;
    target.order = tempOrder;

    // Send PUT updates
    try {
      await Promise.all([
        fetch(`/api/admin/settings/slides/${current.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: current.order }),
        }),
        fetch(`/api/admin/settings/slides/${target.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: target.order }),
        })
      ]);
      fetchData();
    } catch (error) {
      console.error("Order move error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary animate-spin-slow" /> Kustomisasi Visual & UI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ubah warna utama platform, kelola slideshow banner hero, dan atur tampilan branding secara dinamis.
          </p>
        </div>
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-2 rounded-xl text-sm font-semibold animate-pulse">
            <CheckCircle className="h-4 w-4" />
            {successMsg}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="h-4 w-4" /> Pengaturan Umum & Branding
        </button>
        <button
          onClick={() => setActiveTab("slides")}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "slides"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" /> Slideshow Banner Hero
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* ════════ TAB 1: GENERAL CONFIGS ════════ */}
          {activeTab === "general" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Settings Form */}
              <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                  Branding & Warna Tema
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Nama Marketplace
                    </label>
                    <input
                      type="text"
                      value={configs.site_name}
                      onChange={(e) => setConfigs({ ...configs, site_name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Warna Tema Utama (Primary HEX)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={configs.primary_color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfigs({ ...configs, primary_color: val });
                          document.documentElement.style.setProperty("--primary", val);
                          document.documentElement.style.setProperty("--ring", val);
                        }}
                        className="h-10 w-12 rounded-xl border border-border bg-background p-1.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={configs.primary_color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfigs({ ...configs, primary_color: val });
                          if (val.match(/^#[0-9A-Fa-f]{6}$/)) {
                            document.documentElement.style.setProperty("--primary", val);
                            document.documentElement.style.setProperty("--ring", val);
                          }
                        }}
                        placeholder="#0DA9BA"
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-border/50" />

                {/* Announcement Banner Panel */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Banner Pengumuman Atas (Header Banner)</h4>
                      <p className="text-xs text-muted-foreground">Tampilkan strip info promo di paling atas seluruh halaman website.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={configs.announcement_enabled === "true"} 
                        onChange={(e) => setConfigs({ ...configs, announcement_enabled: String(e.target.checked) })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {configs.announcement_enabled === "true" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Teks Pengumuman (Bahasa Indonesia)
                        </label>
                        <input
                          type="text"
                          value={configs.announcement_text_id}
                          onChange={(e) => setConfigs({ ...configs, announcement_text_id: e.target.value })}
                          placeholder="Dapatkan promo gratis ongkir..."
                          className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Teks Pengumuman (English)
                        </label>
                        <input
                          type="text"
                          value={configs.announcement_text_en}
                          onChange={(e) => setConfigs({ ...configs, announcement_text_en: e.target.value })}
                          placeholder="Get free shipping promotion..."
                          className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={handleSaveConfigs}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground px-6 py-3 hover:bg-primary/95 transition-all active:scale-95 shadow-md disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Simpan Konfigurasi Platform
                  </button>
                </div>
              </div>

              {/* Theme Live Preview */}
              <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                    <Eye className="h-5 w-5 text-primary" /> Live Preview Tema
                  </h3>
                  <p className="text-xs text-muted-foreground">Bagaimana skema warna diaplikasikan ke komponen tombol dan teks utama website.</p>
                </div>

                <div className="p-6 rounded-2xl bg-muted/40 border border-border/50 space-y-4">
                  {/* Banner Preview */}
                  {configs.announcement_enabled === "true" && (
                    <div 
                      style={{ backgroundColor: configs.primary_color }} 
                      className="rounded-lg p-2 text-center text-[10px] text-white font-medium truncate"
                    >
                      {configs.announcement_text_id || "Contoh Pengumuman Promo"}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span style={{ color: configs.primary_color }} className="font-serif text-xl font-bold">
                      Art <span className="italic font-normal">and</span> Craft
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Setiap produk menyimpan cerita dedikasi, ketelitian, dan cinta dari tangan-tangan kreatif lokal.
                  </p>

                  <div className="flex gap-2">
                    <button 
                      style={{ backgroundColor: configs.primary_color }} 
                      className="flex-1 py-2 rounded-lg text-white text-xs font-bold shadow-sm"
                    >
                      Beli Sekarang
                    </button>
                    <button 
                      style={{ color: configs.primary_color, borderColor: configs.primary_color }} 
                      className="flex-1 py-2 rounded-lg border text-xs font-bold bg-background"
                    >
                      Tanya Pengrajin
                    </button>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-3.5 border border-primary/10 flex items-start gap-2.5 text-xs text-primary leading-relaxed">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Setelah menyimpan, warna primer akan langsung diterapkan secara global pada root CSS website tanpa perlu memicu kompilasi ulang kode.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB 2: HERO SLIDES ════════ */}
          {activeTab === "slides" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-card p-4 border border-border rounded-xl">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Total Banner Aktif: <strong>{slides.filter(s => s.isActive).length}</strong>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-1.5 rounded-lg bg-primary text-xs font-bold text-primary-foreground px-4 py-2 hover:bg-primary/95 transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Tambah Banner Slide
                </button>
              </div>

              {/* Slides List Grid */}
              <div className="grid grid-cols-1 gap-4">
                {slides.map((s, index) => (
                  <div 
                    key={s.id} 
                    className={`bg-card border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between transition-all hover:border-primary/40 ${
                      !s.isActive ? "opacity-60 border-dashed" : "border-border"
                    }`}
                  >
                    {/* Image Preview & Order controls */}
                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                      {/* Order shift buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => handleMoveOrder(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:hover:bg-muted"
                          title="Geser Ke Atas"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <span className="text-center font-mono text-xs font-bold text-foreground py-0.5">
                          {s.order}
                        </span>
                        <button
                          onClick={() => handleMoveOrder(index, "down")}
                          disabled={index === slides.length - 1}
                          className="p-1 rounded bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:hover:bg-muted"
                          title="Geser Ke Bawah"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Slide Thumbnail */}
                      <div className="relative h-20 w-36 rounded-xl overflow-hidden border border-border/80 bg-muted/20 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={s.imageUrl} 
                          alt={s.titleId} 
                          className="h-full w-full object-cover" 
                        />
                        {!s.isActive && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold tracking-wider uppercase">
                            Nonaktif
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Texts Details */}
                    <div className="flex-1 min-w-0 space-y-1.5 w-full">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wide uppercase">
                          {s.tagId}
                        </span>
                        {s.btnLink && (
                          <span className="text-[10px] text-muted-foreground truncate font-mono bg-muted/65 px-2 py-0.5 rounded border border-border/30">
                            CTA: {s.btnLink}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif text-base font-bold text-foreground truncate">
                        {s.titleId}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {s.subtitleId}
                      </p>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t border-border/30 pt-3 md:border-t-0 md:pt-0">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-2 rounded-xl border border-border text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        title="Edit Banner"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(s.id)}
                        className="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                        title="Hapus Banner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ════════ POPUP MODAL: SLIDE EDITOR ════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {editingSlide ? "Edit Slide Hero Banner" : "Tambah Slide Hero Banner Baru"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSlide} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Photo Background Dropzone (Direct R2 Upload) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Foto Background Hero Banner (Upload ke R2)
                </label>
                <ImageDropzone
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="hero-slides"
                />
              </div>

              {/* Redirection link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Tautan Redireksi Tombol (CTA Button Link)
                </label>
                <input
                  type="text"
                  value={formData.btnLink}
                  onChange={(e) => setFormData({ ...formData, btnLink: e.target.value })}
                  placeholder="/search?category=batik"
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Order & Active toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    No. Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pl-4 border border-border rounded-xl bg-muted/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aktifkan Slide</span>
                  <label className="relative inline-flex items-center cursor-pointer mr-4">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <hr className="border-border/50" />

              {/* Bilingual tabs wrapper */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-sm font-serif font-bold text-foreground">Teks Slide Banner</span>
                  <div className="flex rounded-lg overflow-hidden border border-border">
                    <button
                      type="button"
                      onClick={() => setFormLangTab("id")}
                      className={`px-3 py-1.5 text-xs font-semibold ${
                        formLangTab === "id" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🇮🇩 Bahasa Indonesia
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormLangTab("en")}
                      className={`px-3 py-1.5 text-xs font-semibold ${
                        formLangTab === "en" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                </div>

                {formLangTab === "id" ? (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Tag Slide (Indonesian)
                      </label>
                      <input
                        type="text"
                        value={formData.tagId}
                        onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}
                        placeholder="Contoh: Otentik & Handmade"
                        required={formLangTab === "id"}
                        className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Judul Promosi (Indonesian)
                      </label>
                      <input
                        type="text"
                        value={formData.titleId}
                        onChange={(e) => setFormData({ ...formData, titleId: e.target.value })}
                        placeholder="Contoh: Temukan Keunikan Karya Anak Bangsa"
                        required={formLangTab === "id"}
                        className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Subjudul (Indonesian)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.subtitleId}
                        onChange={(e) => setFormData({ ...formData, subtitleId: e.target.value })}
                        placeholder="Dukung pengrajin lokal dan temukan karya seni otentik..."
                        className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Teks Tombol CTA (Indonesian)
                      </label>
                      <input
                        type="text"
                        value={formData.btnTextId}
                        onChange={(e) => setFormData({ ...formData, btnTextId: e.target.value })}
                        placeholder="Contoh: Jelajahi Sekarang"
                        className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {/* Auto Translate Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAutoTranslate}
                        disabled={isTranslating}
                        className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 px-3.5 py-2 rounded-xl border border-primary/20 disabled:opacity-50 transition-colors shadow-sm active:scale-95"
                      >
                        {isTranslating ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menerjemahkan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" /> Terjemahkan Otomatis dari B. Indonesia
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Tag Slide (English)
                      </label>
                      <input
                        type="text"
                        value={formData.tagEn}
                        onChange={(e) => setFormData({ ...formData, tagEn: e.target.value })}
                        placeholder="Contoh: Authentic & Handmade"
                        required={formLangTab === "en"}
                        className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Judul Promosi (English)
                      </label>
                      <input
                        type="text"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        placeholder="Contoh: Discover Unique Creations by Local Artisans"
                        required={formLangTab === "en"}
                        className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Subjudul (English)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.subtitleEn}
                        onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                        placeholder="Support local artisans and find authentic artworks..."
                        className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Teks Tombol CTA (English)
                      </label>
                      <input
                        type="text"
                        value={formData.btnTextEn}
                        onChange={(e) => setFormData({ ...formData, btnTextEn: e.target.value })}
                        placeholder="Contoh: Explore Now"
                        className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions panel */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
