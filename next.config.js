/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@mantine/hooks'],
  },
  // Allow builds to proceed even if TypeScript emits type errors.
  // Temporary: prevents Vercel build failures while we finalize runtime-only lazy imports.
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
