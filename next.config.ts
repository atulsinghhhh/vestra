import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyTimeout: 30_000,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "iqjdcelihzdjpsqnveex.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.mytheresa.com",
      },
    ],
  },
};

export default nextConfig;
