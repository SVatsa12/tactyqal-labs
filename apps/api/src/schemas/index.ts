import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

const url = z
  .string()
  .trim()
  .url()
  .max(2048)
  .refine((v) => /^https?:\/\//.test(v), "Must be an http(s) URL");

// ---------------------------------------------------------------- auth

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

// ---------------------------------------------------------------- posts

export const postStatus = z.enum(["DRAFT", "PUBLISHED"]);

export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: slug.optional(),
  excerpt: optionalText(500),
  content: z.string().max(500_000).default(""),
  coverImageUrl: url.nullish().transform((v) => v ?? null),
  status: postStatus.default("DRAFT"),
  publishedAt: z.coerce.date().nullish(),
  seoTitle: optionalText(200),
  seoDescription: optionalText(320),
  categoryIds: z.array(z.string().min(1)).max(20).default([]),
  tagIds: z.array(z.string().min(1)).max(50).default([]),
});

export const updatePostSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    slug,
    excerpt: optionalText(500),
    content: z.string().max(500_000),
    coverImageUrl: url.nullish().transform((v) => v ?? null),
    status: postStatus,
    publishedAt: z.coerce.date().nullish(),
    seoTitle: optionalText(200),
    seoDescription: optionalText(320),
    categoryIds: z.array(z.string().min(1)).max(20),
    tagIds: z.array(z.string().min(1)).max(50),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");

export const listPostsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z
    .enum(["draft", "published", "all", "DRAFT", "PUBLISHED", "ALL"])
    .optional()
    .transform((v) => (v ? (v.toUpperCase() as "DRAFT" | "PUBLISHED" | "ALL") : undefined)),
  q: z.string().trim().max(200).optional(),
  category: slug.optional(),
  tag: slug.optional(),
});

export const idParam = z.object({ id: z.string().min(1).max(200) });

// ---------------------------------------------------------------- taxonomy

export const createTermSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: slug.optional(),
});

export const updateTermSchema = createTermSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");

// ---------------------------------------------------------------- leads

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .regex(/^[+\d\s()-]*$/, "Use digits, spaces, +, - or brackets only")
    .nullish()
    .transform((v) => (v ? v : null)),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
});

export const listLeadsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
