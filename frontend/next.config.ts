import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 设置 Turbopack 根目录，避免警告
  turbopack: {
    root: process.cwd(),
  },
  // 优化开发体验
  experimental: {
    // 启用更快的编译
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
  },
  // 开发时跳过类型检查和 lint 以加快速度
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
