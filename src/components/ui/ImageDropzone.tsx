"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

export default function ImageDropzone({ value, onChange, folder = "general", className = "" }: ImageDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file terlalu besar (maksimal 5MB)");
      setIsUploading(false);
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Tipe file tidak didukung (gunakan JPG, PNG, WEBP, atau GIF)");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }

    try {
      const res = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Gagal mengunggah gambar.");
      }
    } catch (err) {
      console.error(err);
      setError("Kesalahan koneksi saat mengunggah gambar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {value ? (
        // Preview State
        <div className="relative rounded-2xl border border-border overflow-hidden bg-muted/20 group h-44 shadow-inner flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded Preview"
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleButtonClick}
              className="p-2.5 rounded-xl bg-white/95 text-foreground hover:bg-white text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <UploadCloud className="h-4 w-4 text-primary" /> Ubah Foto
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <X className="h-4 w-4" /> Hapus
            </button>
          </div>
        </div>
      ) : (
        // Dropzone Area State
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center h-44 min-h-[176px] ${
            isDragActive
              ? "border-primary bg-primary/5 scale-[0.99] ring-4 ring-primary/10"
              : "border-border bg-card hover:bg-muted/10 hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="space-y-2.5 flex flex-col items-center justify-center">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground">Sedang mengunggah ke Cloudflare R2...</p>
            </div>
          ) : (
            <div className="space-y-3.5 flex flex-col items-center justify-center">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Seret & lepas berkas gambar di sini, atau <span className="text-primary hover:underline">cari berkas</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Mendukung JPG, PNG, WEBP, atau GIF (Maksimal 5MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message Display */}
      {error && (
        <div className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-2">
          <X className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
