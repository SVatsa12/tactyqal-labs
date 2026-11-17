import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { getPost } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Params = Promise<{ slug: string }>;

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: site.blogPage.notFoundTitle };
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  return {
    title: post.seoTitle ?? post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle ?? post.title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (post === undefined) notFound();

  const t = site.blogPage;

  if (post === null) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-h2">{t.unavailableTitle}</h1>
        <p className="mt-4 text-muted">{t.unavailableBody}</p>
      </div>
    );
  }

  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const author = post.author?.name ?? site.blog.defaultAuthor;
  const primaryCategory = post.categories[0];

  return (
    <article>
      <header className="container-page max-w-3xl pb-10 pt-12 md:pt-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.backToBlog}
        </Link>

        {primaryCategory ? (
          <p className="mt-8">
            <a
              href={`/blog?category=${primaryCategory.slug}`}
              className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-ink hover:underline underline-offset-4"
            >
              {primaryCategory.name}
            </a>
          </p>
        ) : null}

        <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.5rem)] leading-[1.06]">{post.title}</h1>

        {post.excerpt ? (
          <p className="mt-5 text-lg leading-relaxed text-muted md:text-xl">{post.excerpt}</p>
        ) : null}

        <div className="mt-7 flex items-center gap-3 text-sm text-muted">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-brand font-display text-sm font-bold text-ink"
          >
            {author.charAt(0).toUpperCase()}
          </span>
          <p>
            <span className="font-medium text-ink">{author}</span>
            {date ? (
              <>
                {" · "}
                <time dateTime={date.toISOString()}>{dateFormat.format(date)}</time>
              </>
            ) : null}
            {post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} ${site.blog.minReadSuffix}` : null}
          </p>
        </div>
      </header>

      {post.coverImageUrl ? (
        <div className="container-page max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-panel)] border border-border bg-brand-soft">
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      {/* Content is sanitized by the API on write (and by the importer). */}
      <div
        className="prose-article container-page max-w-3xl py-12 md:py-16"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <footer className="container-page max-w-3xl pb-20">
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-8">
            <span className="mr-1 text-sm font-semibold text-muted">{t.tagsLabel}</span>
            {post.tags.map((tag) => (
              <a
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium transition-colors hover:border-ink/25"
              >
                {tag.name}
              </a>
            ))}
          </div>
        ) : null}

        <aside className="mt-12 rounded-[var(--radius-panel)] bg-brand-soft p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl">{t.ctaTitle}</h2>
          <p className="mt-3 max-w-lg leading-relaxed text-muted">{t.ctaBody}</p>
          <Button asChild className="mt-6">
            <a href={t.ctaButton.href} target="_blank" rel="noopener noreferrer">
              {t.ctaButton.label}
              <ArrowRight aria-hidden="true" />
              <span className="sr-only"> {site.a11y.opensInNewTab}</span>
            </a>
          </Button>
        </aside>
      </footer>
    </article>
  );
}
