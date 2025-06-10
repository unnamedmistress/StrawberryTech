import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    externalDir: true,
  },
  webpack(config) {
    config.resolve.modules.push(path.resolve(__dirname, "../node_modules"));
    return config;
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
