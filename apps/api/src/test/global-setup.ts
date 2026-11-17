import { execSync } from "node:child_process";

/** host (without Neon's "-pooler") + database + schema: what actually identifies the data. */
function dataKey(raw: string): string {
  const u = new URL(raw);
  return `${u.hostname.replace("-pooler", "")}${u.pathname}#${u.searchParams.get("schema") ?? "public"}`;
}

/**
 * Runs once before all test files: refuses to touch the demo database, then applies
 * migrations to the test database. Without TEST_DATABASE_URL every suite is skipped.
 */
export default function setup() {
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) {
    console.warn(
      [
        "",
        "  ⚠  TEST_DATABASE_URL is not set — skipping the API tests.",
        "     Point it at a separate Neon branch (or a separate schema, e.g. ...?sslmode=require&schema=vitest)",
        "     in apps/api/.env. Tests wipe that database, so never use the demo one.",
        "",
      ].join("\n"),
    );
    return;
  }

  const demo = [process.env.DATABASE_URL, process.env.DIRECT_URL].filter((v): v is string => Boolean(v));
  if (demo.some((url) => dataKey(url) === dataKey(testUrl))) {
    throw new Error(
      "TEST_DATABASE_URL points at the same database and schema as DATABASE_URL. Refusing to run: tests delete data.",
    );
  }

  const directUrl = process.env.TEST_DIRECT_URL ?? testUrl;
  try {
    execSync("pnpm exec prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: testUrl, DIRECT_URL: directUrl },
      stdio: "pipe",
    });
  } catch (error) {
    const out = error as { stdout?: Buffer; stderr?: Buffer };
    console.error(out.stdout?.toString(), out.stderr?.toString());
    throw new Error("Could not migrate the test database (see output above).");
  }
}
