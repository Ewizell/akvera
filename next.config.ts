import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ...остальной конфиг как есть
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.regru.cloud',
      },
    ],
  },
};

export default nextConfig;