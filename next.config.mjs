/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'th.bing.com',
      },
    ],
    domains: ['cdn0.iconfinder.com'],
  },
};

export default nextConfig;
