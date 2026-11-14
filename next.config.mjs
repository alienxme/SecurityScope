/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // `ws` is used server-side for the Lightspeed lookup; keep it out of the webpack bundle.
    serverComponentsExternalPackages: ["ws"],
  },
}

export default nextConfig
