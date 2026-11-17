/**
 * Vercel entry point (zero-config Express). Vercel detects `index.js` next to package.json,
 * runs `pnpm run build` first (prisma generate + tsc -> dist/), then bundles this file as one
 * Vercel Function and calls the default-exported app per request. There is no listen() here;
 * local dev and `pnpm start` keep using src/server.ts.
 *
 * Plain JS on purpose: it loads the app our own `tsc` build already type-checked, so Vercel's
 * separate TypeScript pass (which mis-detects this ESM package's module format) never runs.
 *
 * Neon cold starts are handled per request (connect_timeout=15 in lib/prisma.ts, health check
 * retry). Migrations are not run on Vercel; apply them with `pnpm --filter api db:deploy`.
 */
import "express"; // Vercel's framework detection looks for this import in the entry file.
import { createApp } from "./dist/app.js";

const app = createApp();

export default app;
