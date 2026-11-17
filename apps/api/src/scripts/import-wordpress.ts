/**
 * WordPress -> Tactyqal blog importer (via the WP REST API).
 *
 *   pnpm --filter api import:wp                     # everything from WP_BASE_URL
 *   pnpm --filter api import:wp -- --limit 20       # first 20 posts (newest first)
 *   pnpm --filter api import:wp -- --dry-run        # fetch + transform, write nothing
 *   pnpm --filter api import:wp -- --url https://example.com/blog
 *
 * Idempotent: posts, categories and tags are upserted by their WordPress id,
 * so re-running updates existing rows instead of creating duplicates.
 */
import { parseArgs } from "node:util";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { htmlToText, makeExcerpt, readingTimeMinutes, sanitizeContent, slugify } from "../lib/content.js";

const { values: args } = parseArgs({
  options: {
    url: { type: "string" },
    limit: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    concurrency: { type: "string", default: "5" },
  },
});

const BASE = (args.url ?? process.env.WP_BASE_URL ?? "https://tactyqal.com/blog").replace(/\/$/, "");
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const DRY_RUN = args["dry-run"] ?? false;
const CONCURRENCY = Math.max(1, Number(args.concurrency) || 5);
const PER_PAGE = 100;

// ---------------------------------------------------------------- WP shapes (only what we use)

const rendered = z.object({ rendered: z.string() });

const wpTerm = z.object({ id: z.number(), name: z.string(), slug: z.string() });

const wpPost = z.object({
  id: z.number(),
  date_gmt: z.string(),
  modified_gmt: z.string().optional(),
  slug: z.string(),
  status: z.string(),
  title: rendered,
  content: rendered,
  excerpt: rendered,
  categories: z.array(z.number()).default([]),
  tags: z.array(z.number()).default([]),
  yoast_head_json: z
    .object({ title: z.string().optional(), description: z.string().optional() })
    .partial()
    .nullish(),
  _embedded: z
    .object({
      "wp:featuredmedia": z
        .array(z.object({ source_url: z.string().optional() }).passthrough())
        .optional(),
    })
    .passthrough()
    .optional(),
});

type WpPost = z.infer<typeof wpPost>;

// ---------------------------------------------------------------- fetch helpers

async function fetchJson(url: string, attempt = 1): Promise<{ body: unknown; totalPages: number }> {
  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "tactyqal-importer/1.0" } });
  if (!res.ok) {
    if (attempt < 4 && (res.status >= 500 || res.status === 429)) {
      await new Promise((r) => setTimeout(r, attempt * 1500));
      return fetchJson(url, attempt + 1);
    }
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  }
  return { body: await res.json(), totalPages: Number(res.headers.get("x-wp-totalpages") ?? "1") };
}

async function fetchAll<T>(path: string, schema: z.ZodType<T>, max = Infinity): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const sep = path.includes("?") ? "&" : "?";
    const { body, totalPages: tp } = await fetchJson(`${BASE}/wp-json/wp/v2/${path}${sep}per_page=${PER_PAGE}&page=${page}`);
    totalPages = tp;
    const items = z.array(z.unknown()).parse(body);
    for (const item of items) {
      const parsed = schema.safeParse(item);
      if (parsed.success) out.push(parsed.data);
      else console.warn(`  skipped malformed item in ${path}: ${parsed.error.issues[0]?.message}`);
      if (out.length >= max) return out;
    }
    process.stdout.write(`\r  ${path.split("?")[0]}: page ${page}/${totalPages} (${out.length})`);
    page++;
  } while (page <= totalPages);
  process.stdout.write("\n");
  return out;
}

// ---------------------------------------------------------------- transform

/** Turn links to the old WP blog into links to our /blog routes. */
function rewriteInternalLinks(html: string): string {
  const host = new URL(BASE).host.replace(/^www\./, "");
  const blogPath = new URL(BASE).pathname.replace(/\/$/, "");
  const re = new RegExp(
    `href="https?://(?:www\\.)?${host.replace(/\./g, "\\.")}${blogPath}/(?!wp-content|wp-json|category|tag|author|page)([a-z0-9-]+)/?"`,
    "gi",
  );
  return html.replace(re, (_m, slug: string) => `href="/blog/${slug.toLowerCase()}"`);
}

/** Strip WordPress block comments and empty paragraphs. */
function cleanWpHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<p>(?:\s|&nbsp;)*<\/p>/g, "")
    .trim();
}

function transform(p: WpPost) {
  const content = sanitizeContent(rewriteInternalLinks(cleanWpHtml(p.content.rendered)));
  // WP auto-excerpts are cut mid-sentence ("…" or "[…]" at the end); hand-written ones are kept.
  const wpExcerpt = htmlToText(p.excerpt.rendered);
  const isAutoExcerpt = !wpExcerpt || /(?:…|\.\.\.|\[…\]|\[\.\.\.\])$/.test(wpExcerpt);
  const title = htmlToText(p.title.rendered) || "Untitled";
  return {
    wpId: p.id,
    slug: slugify(p.slug || title),
    title,
    excerpt: isAutoExcerpt ? makeExcerpt(content, 220) : makeExcerpt(wpExcerpt, 300),
    content,
    coverImageUrl: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
    status: p.status === "publish" ? ("PUBLISHED" as const) : ("DRAFT" as const),
    publishedAt: new Date(`${p.date_gmt}Z`),
    readingTimeMinutes: readingTimeMinutes(content),
    seoTitle: p.yoast_head_json?.title ? htmlToText(p.yoast_head_json.title) : null,
    seoDescription: p.yoast_head_json?.description ?? null,
    categoryWpIds: p.categories,
    tagWpIds: p.tags,
  };
}

// ---------------------------------------------------------------- write

async function upsertTerms(model: "category" | "tag", terms: z.infer<typeof wpTerm>[]) {
  const idByWpId = new Map<number, string>();
  for (const t of terms) {
    const name = htmlToText(t.name);
    const slug = slugify(t.slug || name);
    const db = (model === "category" ? prisma.category : prisma.tag) as typeof prisma.category;
    // Match by wpId first, then adopt an existing term with the same slug.
    const existing =
      (await db.findUnique({ where: { wpId: t.id } })) ?? (await db.findUnique({ where: { slug } }));
    const row = existing
      ? await db.update({ where: { id: existing.id }, data: { name, wpId: t.id } })
      : await db.create({ data: { name, slug, wpId: t.id } });
    idByWpId.set(t.id, row.id);
  }
  return idByWpId;
}

async function resolveSlug(slug: string, wpId: number): Promise<string> {
  const clash = await prisma.post.findUnique({ where: { slug }, select: { wpId: true } });
  if (!clash || clash.wpId === wpId) return slug;
  return `${slug}-wp${wpId}`; // a native post already owns this slug
}

async function runPool<T>(items: T[], size: number, fn: (item: T, i: number) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i]!, i);
      }
    }),
  );
}

async function main() {
  console.log(`Importing from ${BASE}${DRY_RUN ? " (dry run)" : ""}`);

  const [categories, tags, posts] = await Promise.all([
    fetchAll("categories?hide_empty=true", wpTerm),
    fetchAll("tags?hide_empty=true", wpTerm),
    fetchAll("posts?_embed=wp:featuredmedia&orderby=date&order=desc", wpPost, LIMIT),
  ]);
  console.log(`Fetched ${posts.length} posts, ${categories.length} categories, ${tags.length} tags`);

  const transformed = posts.map(transform);

  if (DRY_RUN) {
    const sample = transformed[0];
    if (sample) {
      console.log("Sample:", { ...sample, content: `${sample.content.slice(0, 200)}…` });
    }
    return;
  }

  const catIds = await upsertTerms("category", categories);
  const tagIds = await upsertTerms("tag", tags);
  console.log(`Upserted ${catIds.size} categories, ${tagIds.size} tags`);

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const author = adminEmail
    ? await prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } })
    : null;

  let created = 0;
  let updated = 0;
  let failed = 0;

  await runPool(transformed, CONCURRENCY, async (p, i) => {
    try {
      const { categoryWpIds, tagWpIds, ...fields } = p;
      const categories = categoryWpIds.flatMap((id) => (catIds.has(id) ? [{ id: catIds.get(id)! }] : []));
      const tagsConn = tagWpIds.flatMap((id) => (tagIds.has(id) ? [{ id: tagIds.get(id)! }] : []));
      const slug = await resolveSlug(fields.slug, fields.wpId);
      const existed = await prisma.post.findUnique({ where: { wpId: fields.wpId }, select: { id: true } });

      await prisma.post.upsert({
        where: { wpId: fields.wpId },
        create: {
          ...fields,
          slug,
          authorId: author?.id ?? null,
          categories: { connect: categories },
          tags: { connect: tagsConn },
        },
        update: {
          ...fields,
          slug,
          categories: { set: categories },
          tags: { set: tagsConn },
        },
      });
      if (existed) updated++;
      else created++;
    } catch (err) {
      failed++;
      console.error(`\n  failed wp#${p.wpId} (${p.slug}): ${err instanceof Error ? err.message : String(err)}`);
    }
    process.stdout.write(`\r  posts: ${i + 1}/${transformed.length}`);
  });

  console.log(`\nDone. created=${created} updated=${updated} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((err: unknown) => {
    console.error("\nImport failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
