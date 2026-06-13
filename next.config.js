/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack the correct way in Next.js 16
  experimental: {
    turbo: {
      rules: {},
    },
  },

  // Allow LAN access for dev server
  allowedDevOrigins: ['10.150.196.95'],

  // Fix workspace root warning
  outputFileTracingRoot: '/data/data/com.termux/files/home/jason-ocean',
};

module.exports = nextConfig;
