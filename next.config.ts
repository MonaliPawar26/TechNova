import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['ui-avatars.com', 'res.cloudinary.com'],
  },
  reactStrictMode: false // set to false to avoid dual effects with socket.io connects
};

export default nextConfig;
