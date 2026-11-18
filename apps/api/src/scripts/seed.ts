/**
 * Creates (or updates the password of) the first admin user from ADMIN_* env vars,
 * then upserts the fallback blog posts (by slug) so the site is never empty.
 * Usage: pnpm --filter api db:seed
 */
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { makeExcerpt, readingTimeMinutes, sanitizeContent } from "../lib/content.js";
import { seedPosts, type SeedTerm } from "./seed-posts.js";

const DAY_MS = 24 * 60 * 60 * 1000;

async function upsertTerm(model: "category" | "tag", term: SeedTerm): Promise<{ id: string }> {
  const db = (model === "category" ? prisma.category : prisma.tag) as typeof prisma.category;
  return db.upsert({
    where: { slug: term.slug },
    update: {},
    create: { name: term.name, slug: term.slug },
    select: { id: true },
  });
}

async function seedBlog(authorId: string) {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const p of seedPosts) {
    const category = await upsertTerm("category", p.category);
    const tags = await Promise.all(p.tags.map((t) => upsertTerm("tag", t)));
    const content = sanitizeContent(p.content.trim());
    const fields = {
      title: p.title,
      excerpt: makeExcerpt(p.excerpt, 300),
      content,
      status: "PUBLISHED" as const,
      readingTimeMinutes: readingTimeMinutes(content),
    };
    const existing = await prisma.post.findUnique({ where: { slug: p.slug }, select: { id: true, wpId: true } });
    if (existing?.wpId != null) {
      skipped++; // already replaced by the real WordPress post via import:wp
      continue;
    }
    if (existing) {
      // Leave publishedAt alone so re-seeding does not reshuffle the blog order.
      await prisma.post.update({
        where: { id: existing.id },
        data: { ...fields, categories: { set: [category] }, tags: { set: tags } },
      });
      updated++;
    } else {
      await prisma.post.create({
        data: {
          ...fields,
          slug: p.slug,
          publishedAt: new Date(Date.now() - p.daysAgo * DAY_MS),
          authorId,
          categories: { connect: [category] },
          tags: { connect: tags },
        },
      });
      created++;
    }
  }
  console.log(`Seed posts: created=${created} updated=${updated} skipped(imported)=${skipped}`);
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in apps/api/.env");
  if (password.length < 6) throw new Error("ADMIN_PASSWORD must be at least 6 characters");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN" },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  console.log(`Admin ready: ${user.email}`);
  await seedBlog(user.id);
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
