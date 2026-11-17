import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/errors.js";
import { slugify } from "../lib/content.js";
import { requireAuth } from "../middleware/auth.js";
import { body, params } from "../middleware/validate.js";
import { createTermSchema, idParam, updateTermSchema } from "../schemas/index.js";

type TermModel = "category" | "tag";

/**
 * Categories and tags share the same shape and endpoints, so one factory builds both routers.
 * GET is public (with published-post counts); writes need a token.
 */
export function termsRouter(model: TermModel) {
  const router = Router();
  const label = model === "category" ? "Category" : "Tag";

  // Prisma delegates for category/tag have identical method signatures for what we use here.
  const db = (model === "category" ? prisma.category : prisma.tag) as typeof prisma.category;

  router.get("/", async (_req, res) => {
    const terms = await db.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { posts: { where: { status: "PUBLISHED" } } } },
      },
    });
    res.json({
      data: terms.map(({ _count, ...t }) => ({ ...t, postCount: _count.posts })),
    });
  });

  router.post("/", requireAuth, async (req, res) => {
    const input = body(createTermSchema, req);
    const term = await db.create({
      data: { name: input.name, slug: input.slug ?? slugify(input.name) },
      select: { id: true, name: true, slug: true },
    });
    res.status(201).json({ data: term });
  });

  router.patch("/:id", requireAuth, async (req, res) => {
    const { id } = params(idParam, req);
    const input = body(updateTermSchema, req);
    const term = await db.update({
      where: { id },
      data: input,
      select: { id: true, name: true, slug: true },
    });
    res.json({ data: term });
  });

  router.delete("/:id", requireAuth, async (req, res) => {
    const { id } = params(idParam, req);
    const exists = await db.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new HttpError("NOT_FOUND", `${label} not found`);
    await db.delete({ where: { id } });
    res.status(204).end();
  });

  return router;
}
