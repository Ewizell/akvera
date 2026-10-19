import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ...остальной конфиг как есть
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    qualities: [45, 60, 75],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.regru.cloud',
      },
    ],
  },
};

export default nextConfig;