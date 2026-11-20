import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Studio and Next share dependency-free editorial content helpers.
  turbopack: { root: path.resolve(__dirname, "..") },
  transpilePackages: [
    "@portabletext/react",
    "@portabletext/toolkit",
    "@portabletext/types",
  ],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
