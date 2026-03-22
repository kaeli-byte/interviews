import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize pdfjs-dist to avoid worker bundling issues
  serverExternalPackages: ['pdfjs-dist'],
};

export default nextConfig;
