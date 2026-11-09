import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,

  /**
   * Barrel imports from these packages otherwise pull the whole module graph
   * into a route. Rewriting them to deep imports keeps the initial payload
   * small (SRS 16.6 bundle budget).
   */
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
    ],
    /**
     * Client router cache. `dynamic` stays at 30s on purpose: every office
     * route is access-gated, so a longer client cache would let a revoked
     * session keep rendering a cached page segment. `static` covers the
     * public shell and loading boundaries.
     */
    staleTimes: {
      dynamic: 30,
      static: 300,
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
