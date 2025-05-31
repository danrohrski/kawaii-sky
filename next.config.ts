import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle Phaser for client-side only
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // Add alias for Phaser to help with imports
      config.resolve.alias = {
        ...config.resolve.alias,
        phaser: 'phaser/dist/phaser.min.js',
      };
    }

    // Handle Phaser as external for server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('phaser');
    }

    return config;
  },
  // Ensure client-side only for Phaser
  transpilePackages: ['phaser'],
};

export default nextConfig;
