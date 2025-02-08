/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Change output to export for Netlify
  output: "export",
  // Disable React strict mode for now
  reactStrictMode: false,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uninnet.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/project-thumbnails/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dm4pbkgma/image/upload/**",
      },
    ],
  },
  // Required for static export
  trailingSlash: true,
};

export default nextConfig;
