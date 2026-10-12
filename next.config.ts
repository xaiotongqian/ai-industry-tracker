import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev server is opened at 127.0.0.1 while Next only trusts localhost
  // and the bind host. Without this, the HMR socket is rejected and client
  // components never hydrate.
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
  // Server revalidate windows for lib/ingest loaders.
  cacheLife: {
    news: {
      stale: 60 * 60,
      revalidate: 60 * 60,
      expire: 60 * 60 * 24,
    },
    funding: {
      stale: 60 * 60 * 24,
      revalidate: 60 * 60 * 24,
      expire: 60 * 60 * 24 * 7,
    },
    weekly: {
      stale: 60 * 60 * 24 * 7,
      revalidate: 60 * 60 * 24 * 7,
      expire: 60 * 60 * 24 * 30,
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
