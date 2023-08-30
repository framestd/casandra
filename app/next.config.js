/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: { transpileOnly: true },
        },
      ],
    });

    return config;
  },
  env: {
    APP_NAME: process.env.APP_NAME,
    PORT: process.env.PORT,
    SERVER_BASE_URL: process.env.SERVER_BASE_URL,
    SERVER_INTERNAL_ADDRESS: process.env.SERVER_INTERNAL_ADDRESS,
  },
};

module.exports = nextConfig;
