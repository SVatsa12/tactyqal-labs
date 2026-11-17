/**
 * Vercel entry point (zero-config Express). Vercel detects `index.js` next to package.json,
 * runs `pnpm run build` first (prisma generate + tsc + bundle-vercel.mjs), then bundles this file
 * as one Vercel Function and calls the default-exported app per request. There is no listen()
 * here; local dev and `pnpm start` keep using src/server.ts.
 *
 * It loads dist/vercel/app.js: the app with sanitize-html (CommonJS, which requires the ESM-only
 * htmlparser2) inlined, so nothing require()s an ES module at runtime. See bundle-vercel.mjs.
 *
 * Plain JS on purpose: our own `tsc` build is the type check, so Vercel's separate TypeScript
 * pass (which mis-detects this ESM package's module format) never runs.
 *
 * Neon cold starts are handled per request (connect_timeout=15 in lib/prisma.ts, health check
 * retry). Migrations are not run on Vercel; apply them with `pnpm --filter api db:deploy`.
 */
import "express"; // Vercel's framework detection looks for this import in the entry file.
import { createApp } from "./dist/vercel/app.js";

const app = createApp();

export default app;
