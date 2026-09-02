import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ...остальной конфиг как есть
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;