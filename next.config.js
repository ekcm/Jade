/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure server-side compatibility for client-side APIs
  serverExternalPackages: ['together-ai'],
}

module.exports = nextConfig
