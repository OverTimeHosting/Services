/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/blueprints/:path*',
        destination: '/blueprints/:path*',
      },
    ]
  },
}

module.exports = nextConfig
