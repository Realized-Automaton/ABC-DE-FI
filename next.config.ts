
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { // Pattern for i.ibb.co
        protocol: 'https',
        hostname: 'i.ibb.co', // Correct hostname
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
