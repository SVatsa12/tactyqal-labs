import { env } from "./lib/env.js";
import { formatPrismaError, pingDb, prisma, withDbRetry } from "./lib/prisma.js";
import { createApp } from "./app.js";

const app = createApp();

// Listen straight away (PORT comes from the platform), then wake the database in the background.
// Until it answers, /api/v1/health returns 503 and the platform health check keeps waiting.
const server = app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT} (docs: /api/docs)`);
  void warmUpDatabase();
});

async function warmUpDatabase() {
  const started = Date.now();
  try {
    await withDbRetry(pingDb, {
      attempts: 6,
      delayMs: 2000,
      onRetry: (attempt, err) => {
        const formatted = formatPrismaError(err);
        console.warn(
          `[Startup] Database not reachable yet (attempt ${attempt}): [${formatted.name}] code=${formatted.code} - ${formatted.message}`,
        );
      },
    });
    console.log(`Database connected in ${Date.now() - started}ms`);
  } catch (err) {
    // Don't exit: requests will retry the connection, and the health check reports the state.
    const formatted = formatPrismaError(err);
    console.error(
      `[Startup] Database still unreachable after start-up retries: [${formatted.name}] code=${formatted.code} - ${formatted.message}`,
    );
  }
}

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
