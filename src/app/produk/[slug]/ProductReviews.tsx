"use client";

import { useState, useEffect, useTransition } from "react";
import { Star, MessageCircle, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<string>("0");
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formMsg, setFormMsg] = useState<{type: "success"|"error", text: string} | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setFormMsg({ type: "error", text: "Silakan login untuk memberikan ulasan." });
      return;
    }

    setFormMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormMsg({ type: "success", text: "Ulasan berhasil dikirim!" });
        setComment("");
        setRating(5);
        fetchReviews(); // refresh reviews
      } else {
        setFormMsg({ type: "error", text: data.message || "Gagal mengirim ulasan." });
      }
    });
  };

  if (isLoading) return <div className="py-8 text-center text-muted-foreground animate-pulse">Memuat ulasan...</div>;

  return (
    <div className="space-y-12">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center p-6 bg-card rounded-2xl border border-border">
        <div className="text-center md:text-left">
          <div className="text-5xl font-black text-foreground">{averageRating}</div>
          <div className="flex items-center justify-center md:justify-start gap-1 mt-2 text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`h-5 w-5 ${star <= Math.round(Number(averageRating)) ? "fill-current text-yellow-400" : "text-border"}`} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{totalReviews} ulasan</p>
        </div>
      </div>

      {/* Review Form */}
      {session && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" /> Tulis Ulasan
          </h3>
          
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${star <= rating ? "text-yellow-400" : "text-border hover:text-yellow-200"}`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">Komentar (Opsional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Bagikan pengalaman Anda menggunakan produk ini..."
            />
          </div>

          {formMsg && (
            <div className={`p-3 rounded-lg text-sm ${formMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {formMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
            Belum ada ulasan untuk produk ini.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                  {review.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={review.user.image} alt={review.user.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-foreground">{review.user.name || "Pengguna"}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), "d MMMM yyyy", { locale: id })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-3 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? "fill-current text-yellow-400" : "text-border"}`} />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
