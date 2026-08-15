/** @type {import('next').NextConfig} */
const nextConfig = {
  // Legacy Pages Router code reads these via process.env on client and server.
  // Values come from .env / .env.local — never hardcode secrets here.
  env: {
    BASE_URL: process.env.BASE_URL,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    CLOUD_UPDATE_PRESET: process.env.CLOUD_UPDATE_PRESET,
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUD_API: process.env.CLOUD_API,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;
