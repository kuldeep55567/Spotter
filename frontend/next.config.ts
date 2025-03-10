import type { NextConfig } from "next";

// next.config.js
interface WebpackConfig {
  experiments: {
    asyncWebAssembly: boolean;
    layers: boolean;
  };
}

const nextConfig: NextConfig = {
  webpack: (config: WebpackConfig): WebpackConfig => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }
    return config
  },
}

module.exports = nextConfig
