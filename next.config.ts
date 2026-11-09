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
    /**
     * Deliberately *not* using `experimental.inlineCss`: measured on this app the
     * built sheet is ~189 KB and Next duplicates it (once in `<style>`, once in
     * the RSC payload), so the login document grew to 838 KB / 132.6 KB gzip
     * against 56 KB with a cached `<link>`. The docs' own guidance is to skip
     * inlining when returning visitors are common and the bundle is large — a
     * signed-in office portal is both. The immutable hashed sheet is cached once
     * and reused across every route instead.
     */
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
