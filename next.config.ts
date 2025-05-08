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
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 优化资源加载
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@tabler/icons-react', 'framer-motion'],
  },
  // 优化预加载
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;