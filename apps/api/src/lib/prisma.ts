import { PrismaClient } from "@prisma/client";

/**
 * Neon computes scale to zero and can take several seconds to wake up. Prisma's default
 * connect_timeout is 5s, so a cold start fails the first query. Use 15s unless the URL already
 * sets one (documented in .env.example: append `&connect_timeout=15` to DATABASE_URL).
 */
export function withConnectTimeout(url: string, seconds = 15): string {
  if (/[?&]connect_timeout=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=${seconds}`;
}

const url = process.env.DATABASE_URL;

export const prisma = new PrismaClient(url ? { datasourceUrl: withConnectTimeout(url) } : undefined);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Run `fn`, retrying with a linear backoff while the database is waking up.
 * Use for the first query after start-up and for the health check, not for normal requests.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  {
    attempts = 5,
    delayMs = 2000,
    onRetry,
  }: { attempts?: number; delayMs?: number; onRetry?: (attempt: number, err: unknown) => void } = {},
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= attempts) throw err;
      onRetry?.(attempt, err);
      await sleep(delayMs * attempt);
    }
  }
}

/** Cheapest possible round trip to the database. */
export const pingDb = () => prisma.$queryRaw`SELECT 1`;
