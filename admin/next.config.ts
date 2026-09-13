import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Panel jest aplikacją wyłącznie kliencką — żadna strona nie jest
  // indeksowana ani prerenderowana z danymi.
  reactStrictMode: true,
};

export default nextConfig;
