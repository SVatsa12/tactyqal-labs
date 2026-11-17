import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";
import { body, query } from "../middleware/validate.js";
import { createLeadSchema, listLeadsQuery } from "../schemas/index.js";

export const leadsRouter = Router();

// Spam protection on the public contact form: 5 submissions / 15 min per IP.
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(new HttpError("RATE_LIMITED", "Too many messages. Please try again in a few minutes.")),
});

leadsRouter.post("/", leadLimiter, async (req, res) => {
  const input = body(createLeadSchema, req);
  const lead = await prisma.lead.create({
    data: input,
    select: { id: true, createdAt: true },
  });
  res.status(201).json({ data: lead });
});

leadsRouter.get("/", requireAuth, async (req, res) => {
  const { page, limit } = query(listLeadsQuery, req);
  const [total, leads] = await prisma.$transaction([
    prisma.lead.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  res.json({
    data: leads,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});
