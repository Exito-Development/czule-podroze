import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Osobny katalog builda (np. .next-prod), gdy dev-server i `next start`
  // działają równolegle i nie mogą współdzielić .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
