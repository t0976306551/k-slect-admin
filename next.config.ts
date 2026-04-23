import type { NextConfig } from "next";

const backendBase = (process.env.NEXT_PUBLIC_ADMIN_API_URL ?? 'http://localhost:3001/api').replace('/api', '')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
    ]
  },
};

export default nextConfig;
