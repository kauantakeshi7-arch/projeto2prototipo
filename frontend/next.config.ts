import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.kabum.com.br',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ]
  }
};

export default nextConfig;
