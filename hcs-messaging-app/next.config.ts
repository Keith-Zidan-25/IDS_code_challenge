import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveExtensions: [".md", ".js", ".svg", ".zip", ".yml", ".mjs"]
  }
};

export default nextConfig;
