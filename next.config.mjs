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
  // Disable React strict mode for now
  reactStrictMode: false,
  // Ignore all build errors
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { file: /node_modules/ },
    ];
    return config;
  },
  // Enable experimental features
  experimental: {
    // Enable if you're using app directory
    appDir: true,
    // Ignore build errors
    forceSwcTransforms: true,
    swcMinify: true,
  },
  images: {
    unoptimized: true, // Add this for Netlify
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
