/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
        net: false,
        tls: false,
        fs: false,
        dns: false,
      };
    }

    // Add babel-loader for undici
    config.module.rules.push({
      test: /node_modules\/undici/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
          plugins: ["@babel/plugin-transform-private-methods"],
        },
      },
    });

    return config;
  },
};

module.exports = nextConfig;
