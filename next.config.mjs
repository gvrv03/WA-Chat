/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      "http://10.57.121.132:3000", // ✅ Add your LAN or custom dev origin here
      "http://localhost:3000", // keep localhost too
    ],
  },
};

export default nextConfig;
