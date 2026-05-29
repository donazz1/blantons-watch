import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.0.0.72",
    "http://10.0.0.72:3000",
  ],
};

export default nextConfig;
