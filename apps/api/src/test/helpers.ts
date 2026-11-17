import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../middleware/auth.js";

/** False when TEST_DATABASE_URL is missing: suites use describe.skipIf(!hasTestDb). */
export const hasTestDb = process.env.TEST_DB_ENABLED === "1";

const app = createApp();
export const api = () => request(app);

export const ADMIN = { email: "admin@test.local", password: "correct-horse-battery-staple", name: "Test Admin" };

const TABLES = ["Lead", "Post", "Category", "Tag", "User"] as const;

/**
 * Empties every table in the test database. Refuses unless the app is wired to TEST_DATABASE_URL.
 * Table names are schema-qualified on purpose: Prisma applies `?schema=` to its own queries, but raw
 * SQL resolves unqualified names through the connection's search_path (public), not the test schema.
 */
export async function resetDb(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!hasTestDb || !url || url !== process.env.TEST_DATABASE_URL) {
    throw new Error("resetDb() only runs against TEST_DATABASE_URL");
  }
  const schema = new URL(url).searchParams.get("schema") ?? "public";
  if (!/^\w+$/.test(schema)) throw new Error(`Unexpected schema name: ${schema}`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${TABLES.map((t) => `"${schema}"."${t}"`).join(", ")} CASCADE`);
}

/** Creates the admin user and returns a signed token (no login request, so no login rate limit). */
export async function createAdmin(): Promise<{ id: string; token: string }> {
  const user = await prisma.user.create({
    data: {
      email: ADMIN.email,
      name: ADMIN.name,
      role: "ADMIN",
      passwordHash: await bcrypt.hash(ADMIN.password, 4),
    },
  });
  return { id: user.id, token: signToken({ sub: user.id, email: user.email, name: user.name, role: user.role }) };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export { prisma };
