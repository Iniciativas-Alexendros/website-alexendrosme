import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["radix-ui", "simple-icons"],
  },
};

export default nextConfig;
