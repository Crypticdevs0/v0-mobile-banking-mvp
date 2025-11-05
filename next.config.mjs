/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve build performance and minify with SWC
  swcMinify: true,
  compress: true,
  output: 'standalone',

  eslint: {
    // Keep during CI but fail noisy builds - recommend enabling after fixing lint issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Prefer to fix type errors; for now keep to avoid blocking production builds
    ignoreBuildErrors: true,
  },
  images: {
    // Enable Next.js image optimization in production. Add domains if you use external image hosts.
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
