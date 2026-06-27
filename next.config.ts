import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  cacheMaxMemorySize: 0,
  httpAgentOptions: {
    keepAlive: false,
  },
  experimental: {
    staticGenerationRetryCount: 1,
    staticGenerationMaxConcurrency: 4,
    staticGenerationMinPagesPerWorker: 20,
  },
};

export default nextConfig;
