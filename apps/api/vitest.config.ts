import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vitest/config";

// Local runs read apps/api/.env; CI can provide the variables directly (never overridden).
const envFile = join(import.meta.dirname, ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

const testDb = process.env.TEST_DATABASE_URL;
const placeholder = "postgresql://test-db-not-configured.invalid/none";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    globalSetup: ["./src/test/global-setup.ts"],
    // One shared test database: run files one at a time so resets don't collide.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
    env: {
      NODE_ENV: "test",
      // The app only ever sees the test database.
      DATABASE_URL: testDb ?? placeholder,
      DIRECT_URL: process.env.TEST_DIRECT_URL ?? testDb ?? placeholder,
      JWT_SECRET: "vitest-only-secret-0123456789abcdef",
      JWT_EXPIRES_IN: "1h",
      CORS_ORIGINS: "http://localhost:3000",
      TEST_DB_ENABLED: testDb ? "1" : "",
    },
  },
});
