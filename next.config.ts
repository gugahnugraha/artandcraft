import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Security headers for all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Image optimization — allow external domains (R2 public URL, placeholder, etc.)
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public bucket
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        // AWS S3
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        // Google user profile photos (OAuth)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // UI Avatars fallback
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compress responses
  compress: true,
};

export default nextConfig;
