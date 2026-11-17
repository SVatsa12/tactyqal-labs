import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo root (pnpm workspace), so Next doesn't guess from stray lockfiles.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  reactStrictMode: true,
  // Render <title>/<meta> in <head> for every client, not streamed into <body> on dynamic
  // routes (Next 15 default). Lighthouse and some crawlers only read the head.
  htmlLimitedBots: /.*/,
  // Some browsers and crawlers ask for /favicon.ico regardless of <link rel="icon">.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon.svg" }];
  },
  poweredByHeader: false,
  images: {
    // Blog cover images are arbitrary https URLs (admin input and imported WordPress media).
    // Plain http is only allowed for a local API during development.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      ...(process.env.NODE_ENV === "production" ? [] : [{ protocol: "http" as const, hostname: "localhost" }]),
    ],
  },
};

export default nextConfig;
