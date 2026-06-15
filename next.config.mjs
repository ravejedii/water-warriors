/** @type {import('next').NextConfig} */
const nextConfig = {
  // Linting is run separately; type errors still fail the build.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
