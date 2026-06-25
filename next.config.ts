import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["radix-ui", "simple-icons"],
    optimizeCss: true,
  },
};

export default nextConfig;
