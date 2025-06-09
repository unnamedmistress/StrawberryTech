import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_BASE
    if (base) {
      return [
        {
          source: '/api/:path*',
          destination: `${base}/api/:path*`,
        },
      ]
    }
    return []
  },
};

export default nextConfig;
