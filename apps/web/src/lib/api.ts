import "server-only";
import { z } from "zod";
import { API_URL } from "@/lib/urls";

/**
 * Public client for the blog API (apps/api). Server-side only; no auth.
 * Responses are `{ data, meta? }`. All calls return null when the API is down or
 * replies with something unexpected, so pages can render a graceful fallback.
 */

export { API_URL };

const term = z.object({ id: z.string(), name: z.string(), slug: z.string() });

export const postSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  publishedAt: z.string().nullable(),
  readingTimeMinutes: z.number().int().nonnegative().nullable().optional(),
  updatedAt: z.string().optional(),
  author: z.object({ name: z.string() }).nullable().optional(),
  categories: z.array(term).default([]),
  tags: z.array(term).default([]),
});

export const postSchema = postSummarySchema.extend({
  content: z.string(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
});

export const pageMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const termWithCountSchema = term.extend({ postCount: z.number().optional() });

export type PostSummary = z.infer<typeof postSummarySchema>;
export type Post = z.infer<typeof postSchema>;
export type PageMeta = z.infer<typeof pageMetaSchema>;
export type Term = z.infer<typeof termWithCountSchema>;

async function getJson<S extends z.ZodType>(path: string, schema: S, revalidate = 60): Promise<z.infer<S> | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      next: { revalidate, tags: ["posts"] },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const parsed = schema.safeParse(await res.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Returns the latest published posts, or null if the API is unreachable/invalid. */
export async function getLatestPosts(limit: number): Promise<PostSummary[] | null> {
  const res = await getJson(`/posts?status=published&limit=${limit}`, z.object({ data: z.array(postSummarySchema) }));
  return res?.data ?? null;
}

export async function getPosts(opts: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  tag?: string;
}): Promise<{ data: PostSummary[]; meta: PageMeta } | null> {
  const qs = new URLSearchParams({ status: "published" });
  qs.set("page", String(opts.page ?? 1));
  qs.set("limit", String(opts.limit ?? 12));
  if (opts.q) qs.set("q", opts.q);
  if (opts.category) qs.set("category", opts.category);
  if (opts.tag) qs.set("tag", opts.tag);
  return getJson(`/posts?${qs.toString()}`, z.object({ data: z.array(postSummarySchema), meta: pageMetaSchema }));
}

/** undefined = not found; null = API unavailable. */
export async function getPost(slug: string): Promise<Post | null | undefined> {
  try {
    const res = await fetch(`${API_URL}/api/v1/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: ["posts", `post:${slug}`] },
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 404) return undefined;
    if (!res.ok) return null;
    const parsed = z.object({ data: postSchema }).safeParse(await res.json());
    return parsed.success ? parsed.data.data : null;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Term[] | null> {
  const res = await getJson("/categories", z.object({ data: z.array(termWithCountSchema) }), 300);
  return res?.data ?? null;
}

/**
 * Every published post (slug + dates), paging through the API 100 at a time.
 * Used by generateStaticParams and the sitemap; returns [] if the API is down.
 */
export async function getAllPublishedPosts(): Promise<PostSummary[]> {
  const all: PostSummary[] = [];
  for (let page = 1; page <= 50; page++) {
    const res = await getPosts({ page, limit: 100 });
    if (!res) break;
    all.push(...res.data);
    if (page >= res.meta.totalPages) break;
  }
  return all;
}
