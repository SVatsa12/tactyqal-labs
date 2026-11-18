import { PrismaClient } from "@prisma/client";

/**
 * Sanitizes a database connection string:
 * - Trims whitespace and newlines
 * - Strips surrounding quotes (single or double)
 * - Ensures connect_timeout is present (defaults to 15s for Neon scale-to-zero)
 * - Ensures sslmode=require for Neon domains
 */
export function sanitizeDatabaseUrl(raw?: string, seconds = 15): string {
  if (!raw) return "";
  let str = raw
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
  try {
    const parsed = new URL(str);
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", String(seconds));
    }
    if (!parsed.searchParams.has("sslmode") && parsed.hostname.includes("neon.tech")) {
      parsed.searchParams.set("sslmode", "require");
    }
    return parsed.toString();
  } catch {
    if (!/[?&]connect_timeout=/.test(str)) {
      str = `${str}${str.includes("?") ? "&" : "?"}connect_timeout=${seconds}`;
    }
    if (!/[?&]sslmode=/.test(str) && str.includes("neon.tech")) {
      str = `${str}&sslmode=require`;
    }
    return str;
  }
}

/**
 * Masks credentials in a database URL so it can be logged safely.
 */
export function maskDatabaseUrl(raw?: string): string {
  if (!raw) return "[empty]";
  const str = raw
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
  try {
    const parsed = new URL(str);
    if (parsed.password) {
      parsed.password = "****";
    }
    return parsed.toString();
  } catch {
    return str.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
  }
}

/**
 * Strips password credentials from any error message string.
 */
export function maskErrorMessage(msg: string): string {
  if (!msg) return "";
  return msg.replace(/:\/\/([^:]+):([^@\s"']+)@/g, "://$1:****@");
}

/**
 * Formats a Prisma error to extract code, name, and masked message.
 */
export function formatPrismaError(err: unknown): { code: string; name: string; message: string } {
  if (!err) {
    return { code: "UNKNOWN", name: "UnknownError", message: "Unknown error" };
  }
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, any>;
    const code = e.code || e.errorCode || "NO_CODE";
    const name = e.name || "Error";
    const rawMsg = typeof e.message === "string" ? e.message : String(err);
    return { code: String(code), name: String(name), message: maskErrorMessage(rawMsg) };
  }
  return { code: "PRIMITIVE", name: "Error", message: maskErrorMessage(String(err)) };
}

export function withConnectTimeout(url: string, seconds = 15): string {
  return sanitizeDatabaseUrl(url, seconds);
}

const rawUrl = process.env.DATABASE_URL;
const cleanedUrl = sanitizeDatabaseUrl(rawUrl, 15);

// Sync sanitized URL back to process.env so internal schema resolution matches
if (cleanedUrl) {
  process.env.DATABASE_URL = cleanedUrl;
}

export const prisma = new PrismaClient(cleanedUrl ? { datasourceUrl: cleanedUrl } : undefined);

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
