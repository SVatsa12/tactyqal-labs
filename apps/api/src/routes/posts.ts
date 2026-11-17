import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { HttpError, notFound } from "../lib/errors.js";
import { makeExcerpt, readingTimeMinutes, sanitizeContent, slugify } from "../lib/content.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { body, params, query } from "../middleware/validate.js";
import { createPostSchema, idParam, listPostsQuery, updatePostSchema } from "../schemas/index.js";

export const postsRouter = Router();

const termSelect = { id: true, name: true, slug: true } as const;

const summarySelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  status: true,
  publishedAt: true,
  readingTimeMinutes: true,
  updatedAt: true,
  author: { select: { id: true, name: true } },
  categories: { select: termSelect, orderBy: { name: "asc" } },
  tags: { select: termSelect, orderBy: { name: "asc" } },
} satisfies Prisma.PostSelect;

const detailSelect = {
  ...summarySelect,
  content: true,
  seoTitle: true,
  seoDescription: true,
  createdAt: true,
} satisfies Prisma.PostSelect;

const publicWhere = (): Prisma.PostWhereInput => ({
  status: "PUBLISHED",
  publishedAt: { lte: new Date() },
});

/** Find a free slug: "my-post", then "my-post-2", "my-post-3", ... */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  const taken = await prisma.post.findMany({
    where: { slug: { startsWith: root }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { slug: true },
  });
  const used = new Set(taken.map((p) => p.slug));
  if (!used.has(root)) return root;
  let n = 2;
  while (used.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

// GET /posts — public sees published only; signed-in users can filter by status.
postsRouter.get("/", optionalAuth, async (req, res) => {
  const { page, limit, status, q, category, tag } = query(listPostsQuery, req);

  const where: Prisma.PostWhereInput = {
    ...(req.user ? (status && status !== "ALL" ? { status } : {}) : publicWhere()),
    ...(q
      ? {
          OR: [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }],
        }
      : {}),
    ...(category ? { categories: { some: { slug: category } } } : {}),
    ...(tag ? { tags: { some: { slug: tag } } } : {}),
  };

  const [total, posts] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select: summarySelect,
      orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({
    data: posts,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

// GET /posts/:id — accepts an id or a slug.
postsRouter.get("/:id", optionalAuth, async (req, res) => {
  const { id } = params(idParam, req);
  const post = await prisma.post.findFirst({
    where: { OR: [{ id }, { slug: id }], ...(req.user ? {} : publicWhere()) },
    select: detailSelect,
  });
  if (!post) throw notFound("Post");
  res.json({ data: post });
});

// POST /posts
postsRouter.post("/", requireAuth, async (req, res) => {
  const input = body(createPostSchema, req);
  const content = sanitizeContent(input.content);

  const post = await prisma.post.create({
    data: {
      title: input.title,
      slug: await uniqueSlug(input.slug ?? input.title),
      excerpt: input.excerpt ?? (content ? makeExcerpt(content) : null),
      content,
      coverImageUrl: input.coverImageUrl,
      status: input.status,
      publishedAt: input.publishedAt ?? (input.status === "PUBLISHED" ? new Date() : null),
      readingTimeMinutes: readingTimeMinutes(content),
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      author: { connect: { id: req.user!.sub } },
      categories: { connect: input.categoryIds.map((id) => ({ id })) },
      tags: { connect: input.tagIds.map((id) => ({ id })) },
    },
    select: detailSelect,
  });

  res.status(201).location(`/api/v1/posts/${post.id}`).json({ data: post });
});

// PATCH /posts/:id
postsRouter.patch("/:id", requireAuth, async (req, res) => {
  const { id } = params(idParam, req);
  const input = body(updatePostSchema, req);

  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, status: true, publishedAt: true },
  });
  if (!existing) throw notFound("Post");

  const content = input.content !== undefined ? sanitizeContent(input.content) : undefined;
  const nextStatus = input.status ?? existing.status;

  // A published post always needs a date: keep the existing one, or stamp "now" on first publish.
  let publishedAt = input.publishedAt;
  if (nextStatus === "PUBLISHED" && !publishedAt) {
    publishedAt = existing.publishedAt ?? new Date();
  }

  if (input.slug) {
    const clash = await prisma.post.findFirst({
      where: { slug: input.slug, id: { not: id } },
      select: { id: true },
    });
    if (clash) throw new HttpError("CONFLICT", "Another post already uses this slug", { field: "slug" });
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt !== undefined ? (input.excerpt ?? (content ? makeExcerpt(content) : null)) : undefined,
      content,
      readingTimeMinutes: content !== undefined ? readingTimeMinutes(content) : undefined,
      coverImageUrl: input.coverImageUrl,
      status: input.status,
      publishedAt,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      categories: input.categoryIds ? { set: input.categoryIds.map((cid) => ({ id: cid })) } : undefined,
      tags: input.tagIds ? { set: input.tagIds.map((tid) => ({ id: tid })) } : undefined,
    },
    select: detailSelect,
  });

  res.json({ data: post });
});

// DELETE /posts/:id
postsRouter.delete("/:id", requireAuth, async (req, res) => {
  const { id } = params(idParam, req);
  await prisma.post.delete({ where: { id } }); // P2025 -> 404 in the error handler
  res.status(204).end();
});
