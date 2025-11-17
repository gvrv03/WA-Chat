/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const nextConfig = {
  turbopack: {}, // <-- add this to silence the warning
  experimental: {
    allowedDevOrigins: [
      "http://10.57.121.132:3000",
      "http://localhost:3000",
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);
