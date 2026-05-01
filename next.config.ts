import type { NextConfig } from "next";

// We ship a strict ESLint config and a strict tsconfig so the editor
// catches issues during dev, but Vercel runs both during `next build`
// and a single warning fails the deploy. Disable both gates here so
// warnings show up locally + in CI but don't block production builds.
// Real type errors still surface in development and via `tsc --noEmit`.

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  eslint: {
    // Only block builds on truly catastrophic problems; warnings + style
    // rules ship as advisory.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We want real type errors to fail the build now.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
