/**
 * `prisma migrate deploy` with retries, run by `pnpm start` before the server boots.
 * A cold Neon compute can make the first attempt fail with P1001 (can't reach database).
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// Run the Prisma CLI with this Node binary: no reliance on PATH, node_modules/.bin or a shell.
const require = createRequire(import.meta.url);
const pkgPath = require.resolve("prisma/package.json");
const { bin } = require(pkgPath) as { bin: { prisma: string } };
const prismaCli = join(dirname(pkgPath), bin.prisma);

const ATTEMPTS = 4;

for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], { stdio: "inherit" });
  if (result.status === 0) process.exit(0);
  if (attempt < ATTEMPTS) {
    const waitMs = attempt * 5000;
    console.warn(`prisma migrate deploy failed (attempt ${attempt}/${ATTEMPTS}), retrying in ${waitMs / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

console.error("prisma migrate deploy failed; not starting the server.");
process.exit(1);
