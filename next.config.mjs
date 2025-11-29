/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  output: 'standalone',

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
