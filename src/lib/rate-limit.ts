/**
 * Rate Limiter — In-Memory (Edge/Node compatible)
 *
 * Lightweight rate limiting tanpa Redis untuk Vercel serverless.
 * Menggunakan sliding window algorithm berbasis IP.
 *
 * Catatan: karena Vercel serverless stateless, in-memory store di-reset tiap cold start.
 * Untuk produksi tinggi traffik, gunakan Upstash Redis.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

// Global store — persists across requests dalam satu instance fungsi
const store = new Map<string, WindowEntry>();

// Cleanup expired entries setiap 5 menit untuk mencegah memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Jumlah request maksimum dalam window */
  limit: number;
  /** Durasi window dalam detik */
  windowSec: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Sisa request yang diperbolehkan */
  remaining: number;
  /** Unix timestamp saat limit reset */
  resetAt: number;
}

/**
 * Cek dan catat request dari identifier (biasanya IP + route).
 * Returns success=false jika limit terlampaui.
 */
export function rateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSec * 1000;

  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // Buat window baru
    const newEntry: WindowEntry = { count: 1, resetAt: now + windowMs };
    store.set(identifier, newEntry);
    return { success: true, remaining: config.limit - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  store.set(identifier, entry);
  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Ekstrak IP dari request headers (Vercel-compatible).
 */
export function getClientIp(req: Request): string {
  const headers = new Headers((req as any).headers);
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
