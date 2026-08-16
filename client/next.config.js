/** @type {import('next').NextConfig} */
const API_URL = process.env.STORMLINK_API_URL || 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Browser-facing relative URLs are proxied to the Express API so the
    // frontend never needs to know the backend host.
    return [
      {
        source: '/api/backend/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
