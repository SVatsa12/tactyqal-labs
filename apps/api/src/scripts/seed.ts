/**
 * Creates (or updates the password of) the first admin user from ADMIN_* env vars.
 * Usage: pnpm --filter api db:seed
 */
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in apps/api/.env");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN" },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  console.log(`Admin ready: ${user.email}`);
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
