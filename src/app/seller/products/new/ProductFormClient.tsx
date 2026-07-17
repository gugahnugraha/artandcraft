"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductInput } from "@/features/products/schemas";
import { createProduct } from "@/features/products/actions/create-product";
import {
  FileText,
  DollarSign,
  Package,
  Layers,
  Scale,
  Maximize,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  X,
  Plus,
  Upload,
} from "lucide-react";
import { ProductStatus } from "@prisma/client";

interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export default function ProductFormClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      discount: 0,
      stock: 1,
      weight: 100,
      dimensions: "",
      sku: "",
      categoryId: "",
      subcategoryId: "",
      photos: [],
      status: ProductStatus.ACTIVE,
    },
  });

  const watchCategoryId = watch("categoryId");
  const watchPhotos = watch("photos");

  // Get subcategories for selected category
  const activeSubcategories = categories.find((c) => c.id === watchCategoryId)?.subcategories || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Gagal mengunggah foto.");
      } else {
        const newPhotos = [...uploadedPhotos, result.url];
        setUploadedPhotos(newPhotos);
        setValue("photos", newPhotos, { shouldValidate: true });
      }
    } catch (err) {
      setError("Masalah koneksi. Gagal menghubungi endpoint upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, idx) => idx !== index);
    setUploadedPhotos(newPhotos);
    setValue("photos", newPhotos, { shouldValidate: true });
  };

  const onSubmit = async (data: ProductInput) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await createProduct(data);
      if (res?.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else {
        router.push("/seller/products");
        router.refresh();
      }
    } catch (err) {
      setError("Gagal menyimpan produk karena masalah jaringan.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card border border-border/50 p-8 rounded-2xl shadow-sm">
        
        {/* Photos Upload Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2 flex items-center gap-2">
            <ImageIcon className="h-4.5 w-4.5 text-primary" />
            Foto Produk (Minimal 1)
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Display uploaded thumbnails */}
            {uploadedPhotos.map((photo, idx) => (
              <div key={idx} className="aspect-square relative rounded-xl border border-border overflow-hidden bg-accent/20 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`Foto ${idx + 1}`} className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-2 right-2 rounded-full bg-black/60 text-white p-1 hover:bg-black/85 transition-colors shadow"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}

            {/* Upload Button Box */}
            {uploadedPhotos.length < 8 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/55 cursor-pointer flex flex-col items-center justify-center gap-2 bg-background hover:bg-accent/10 transition-all">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-semibold">Unggah Foto</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}

          </div>
          {errors.photos && (
            <p className="text-xs text-destructive mt-1.5">{errors.photos.message}</p>
          )}
        </div>

        {/* Basic Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2 flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-primary" />
            Detail Informasi Karya
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Nama Produk / Karya</label>
            <input
              type="text"
              placeholder="Contoh: Kendi Tanah Liat Kasongan Klasik"
              className={`w-full rounded-lg border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                errors.title ? "border-destructive" : "border-border"
              }`}
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Deskripsi Detail</label>
            <textarea
              rows={5}
              placeholder="Jelaskan mengenai keunikan produk, bahan yang digunakan, dan kisah pembuatannya..."
              className={`w-full rounded-lg border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                errors.description ? "border-destructive" : "border-border"
              }`}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Categories Grid options */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-primary" />
            Kategori
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Kategori Utama</label>
              <select
                className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                {...register("categoryId")}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Subcategory Select */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Subkategori (Opsional)</label>
              <select
                disabled={!watchCategoryId}
                className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                {...register("subcategoryId")}
              >
                <option value="">-- Pilih Subkategori --</option>
                {activeSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Inventory, Pricing & Specifications */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2 flex items-center gap-2">
            <Package className="h-4.5 w-4.5 text-primary" />
            Harga, Stok & Inventori
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Harga (Rp)</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="number"
                  placeholder="150000"
                  className={`w-full rounded-lg border bg-background py-2.5 pl-8 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.price ? "border-destructive" : "border-border"
                  }`}
                  {...register("price")}
                />
              </div>
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Diskon (%)</label>
              <input
                type="number"
                placeholder="10"
                className={`w-full rounded-lg border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                  errors.discount ? "border-destructive" : "border-border"
                }`}
                {...register("discount")}
              />
              {errors.discount && <p className="text-xs text-destructive mt-1">{errors.discount.message}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Jumlah Stok</label>
              <input
                type="number"
                placeholder="5"
                className={`w-full rounded-lg border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                  errors.stock ? "border-destructive" : "border-border"
                }`}
                {...register("stock")}
              />
              {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Weight */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                <Scale className="h-3.5 w-3.5" /> Berat (Gram)
              </label>
              <input
                type="number"
                placeholder="1000"
                className={`w-full rounded-lg border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                  errors.weight ? "border-destructive" : "border-border"
                }`}
                {...register("weight")}
              />
              {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight.message}</p>}
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" /> Dimensi (P x L x T)
              </label>
              <input
                type="text"
                placeholder="30cm x 15cm x 15cm"
                className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                {...register("dimensions")}
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Kode SKU (Unik)</label>
              <input
                type="text"
                placeholder="KAS-POT-V01"
                className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                {...register("sku")}
              />
            </div>
          </div>
        </div>

        {/* Product Status & Submit controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-border/40 pt-6 mt-8">
          
          {/* Status select */}
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-bold text-foreground mb-1.5">Status Produk</label>
            <select
              className="rounded-lg border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all w-full sm:w-auto"
              {...register("status")}
            >
              <option value="ACTIVE">Aktif (Langsung Terbit)</option>
              <option value="DRAFT">Draf (Simpan Saja)</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan Produk...</span>
                </>
              ) : (
                <span>Terbitkan Produk</span>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
