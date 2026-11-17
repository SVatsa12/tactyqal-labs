/**
 * Builds dist/vercel/app.js, the bundle that index.js (the Vercel entry) loads. Runs as the last
 * step of `pnpm build`, after tsc has type-checked the sources.
 *
 * Why: sanitize-html is CommonJS and calls require("htmlparser2"), which is ESM-only since v11.
 * Whether a runtime can require() an ES module depends on the Node version and loader, and Vercel's
 * function runtime can't (ERR_REQUIRE_ESM). Bundling sanitize-html and its dependency tree turns that
 * require() into ordinary bundled code. Every other package stays external, so Vercel traces it
 * from node_modules as usual (Prisma's native query engine must stay a real file).
 */
import { readFileSync } from "node:fs";
import { build } from "esbuild";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

/** Packages to inline: the CommonJS sanitizer whose dependency tree contains ESM-only packages. */
const INLINE = new Set(["sanitize-html"]);
const external = Object.keys(pkg.dependencies).filter((name) => !INLINE.has(name));

await build({
  entryPoints: ["src/app.ts"],
  outfile: "dist/vercel/app.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  external,
  sourcemap: true,
  logLevel: "warning",
  // CommonJS code inside an ESM bundle still calls require() for Node built-ins (postcss uses
  // path, fs, url). Give the bundle a real require for those.
  banner: {
    js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
  },
});

console.log(`Vercel bundle: dist/vercel/app.js (inlined: ${[...INLINE].join(", ")})`);
