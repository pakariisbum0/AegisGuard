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
  images: {
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
};

export default nextConfig;
