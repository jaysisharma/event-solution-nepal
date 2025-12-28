/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 80, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'eventsolutionnepal.com.np',
      },
    ],
  },
};

export default nextConfig;
