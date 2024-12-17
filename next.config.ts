import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // 允许所有 HTTPS 域名
      },
    ],
  },
};

export default nextConfig;