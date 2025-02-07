/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dm4pbkgma/image/upload/**",
      },
    ],
  },
  // ... any other existing config
};

module.exports = nextConfig;
