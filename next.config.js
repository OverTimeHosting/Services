/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix for webpack module loading issues
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    }
    return config
  },
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
