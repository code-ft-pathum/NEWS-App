import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Image Optimization for SEO */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.newsapi.org",
      },
      {
        protocol: "https",
        hostname: "**.com",
      },
      {
        protocol: "https",
        hostname: "**.org",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  /* Enable compression for better performance (SEO factor) */
  compress: true,

  /* Generate ETags for cache validation */
  generateEtags: true,

  /* Configure headers for SEO and security */
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  /* Redirects */
  redirects: async () => {
    return [];
  },

  /* Rewrite for serving sitemap and robots */
  rewrites: async () => {
    return {
      beforeFiles: [],
    };
  },
};

export default nextConfig;
