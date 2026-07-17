"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  photos: string[];
  title: string;
}

export default function ProductGallery({ photos, title }: ProductGalleryProps) {
  const hasPhotos = photos && photos.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  const next = () => setActiveIndex((i) => (i < photos.length - 1 ? i + 1 : 0));

  if (!hasPhotos) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-primary/5 border border-border flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl font-serif text-foreground/10 block mb-3">
            {title.split(" ").slice(-1)[0]}
          </span>
          <p className="text-xs text-muted-foreground">Foto belum tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="aspect-square w-full rounded-2xl overflow-hidden border border-border relative group bg-accent/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[activeIndex]}
          alt={`${title} - foto ${activeIndex + 1}`}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Navigation arrows (shown only if multiple photos) */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/65 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/65 backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? "bg-white w-4" : "bg-white/50 w-1.5"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Photo count badge */}
        {photos.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/40 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {activeIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnails strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                idx === activeIndex ? "border-primary shadow-md" : "border-transparent hover:border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`Thumbnail ${idx + 1}`}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
