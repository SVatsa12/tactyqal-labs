import type { Metadata } from "next";
import { Search } from "lucide-react";
import { z } from "zod";
import { site } from "@/content/site";
import { getCategories, getPosts } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PostGrid } from "@/components/blog/post-grid";
import { Pagination } from "@/components/blog/pagination";
import { FeaturedPost } from "@/components/blog/featured-post";
import { FadeUp } from "@/components/ui/fade-up";

export const metadata: Metadata = {
  title: site.blogPage.metaTitle,
  description: site.blogPage.description,
  alternates: { canonical: "/blog" },
};

const searchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
  q: z.string().trim().max(100).optional().catch(undefined),
  category: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(120)
    .optional()
    .catch(undefined),
  tag: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(120)
    .optional()
    .catch(undefined),
});

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function BlogIndexPage({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const { page, q, category, tag } = searchParamsSchema.parse(flat);
  const t = site.blogPage;

  const [result, categories] = await Promise.all([
    getPosts({ page, q, category, tag, limit: 12 }),
    getCategories(),
  ]);

  const hrefWith = (next: Partial<{ page: number; q: string; category: string; tag: string }>) => {
    const params = new URLSearchParams();
    const merged = { q, category, tag, ...next };
    if (merged.q) params.set("q", merged.q);
    if (merged.category) params.set("category", merged.category);
    if (merged.tag) params.set("tag", merged.tag);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const s = params.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  // Page 1 of the unsearched list leads with the newest post as a large card.
  const showFeatured = page === 1 && !q && result !== null && result.data.length > 0;
  const featured = showFeatured ? result.data[0] : null;
  const rest = result ? (showFeatured ? result.data.slice(1) : result.data) : [];

  const visibleCategories = (categories ?? []).filter((c) => (c.postCount ?? 0) > 0);

  return (
    <>
      {/* Header */}
      <section aria-labelledby="blog-index-title" className="border-b border-border">
        <div className="container-page pb-14 pt-14 md:pb-20 md:pt-20">
          <FadeUp>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-ink">{t.eyebrow}</p>
            <h1 id="blog-index-title" className="text-h1 mt-4 max-w-3xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{t.description}</p>
          </FadeUp>

          <FadeUp delay={0.05}>
            <form action="/blog" method="get" role="search" className="mt-9 flex max-w-xl gap-2">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <label htmlFor="blog-search" className="sr-only">
                {t.searchLabel}
              </label>
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  id="blog-search"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder={t.searchPlaceholder}
                  className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-base shadow-soft placeholder:text-muted focus-visible:border-ink/30"
                />
              </div>
              <button
                type="submit"
                className="h-12 rounded-full bg-ink px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-ink/85"
              >
                {t.searchButton}
              </button>
            </form>
          </FadeUp>

          {visibleCategories.length > 0 ? (
            <FadeUp delay={0.1}>
              <nav aria-label={t.categoriesLabel} className="mt-7">
                <ul className="flex flex-wrap gap-2">
                  <li>
                    <Chip href={hrefWith({ category: undefined, tag: undefined })} active={!category && !tag}>
                      {t.allLabel}
                    </Chip>
                  </li>
                  {visibleCategories.map((c) => (
                    <li key={c.id}>
                      <Chip href={hrefWith({ category: c.slug, tag: undefined })} active={category === c.slug}>
                        {c.name}
                        <span className="ml-1.5 text-muted">{c.postCount}</span>
                      </Chip>
                    </li>
                  ))}
                </ul>
              </nav>
            </FadeUp>
          ) : null}
        </div>
      </section>

      {/* Results */}
      <section aria-label={t.metaTitle} className="container-page py-14 md:py-20">
        {q ? (
          <p className="mb-8 text-muted">
            {t.resultsFor} <span className="font-semibold text-ink">“{q}”</span>
            {result ? ` · ${result.meta.total}` : null}{" "}
            <a href={hrefWith({ q: undefined })} className="ml-2 font-semibold text-brand-ink underline-offset-4 hover:underline">
              {t.clearSearch}
            </a>
          </p>
        ) : null}

        {result === null ? (
          <EmptyState title={t.unavailableTitle} body={t.unavailableBody} />
        ) : result.data.length === 0 ? (
          <EmptyState title={t.emptyTitle} body={t.emptyBody} />
        ) : (
          <>
            {featured ? (
              <FadeUp className="mb-5">
                <FeaturedPost post={featured} />
              </FadeUp>
            ) : null}
            {rest.length > 0 ? <PostGrid posts={rest} patternOffset={featured ? 1 : 0} /> : null}
            <Pagination
              page={result.meta.page}
              totalPages={result.meta.totalPages}
              hrefFor={(p) => hrefWith({ page: p })}
            />
          </>
        )}
      </section>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-ink bg-ink text-white [&>span]:text-on-ink-muted"
          : "border-border bg-surface text-ink hover:border-ink/25",
      )}
    >
      {children}
    </a>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-dashed border-border bg-surface px-6 py-16 text-center">
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-2 text-muted">{body}</p>
    </div>
  );
}
