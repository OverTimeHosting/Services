/** @type {import('next').NextConfig} */
const nextConfig = {
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
