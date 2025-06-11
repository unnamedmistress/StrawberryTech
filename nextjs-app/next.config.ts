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
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    };
    return config;
  },  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_BASE
    // Only use external API in development or when explicitly configured
    if (base && process.env.NODE_ENV === 'development') {
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
