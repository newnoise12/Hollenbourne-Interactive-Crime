import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly — without this, Next.js guesses based on
  // nearby lockfiles, which is fragile in a container with multiple projects.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
