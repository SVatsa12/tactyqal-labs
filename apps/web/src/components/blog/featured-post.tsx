import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import type { PostSummary } from "@/lib/api";
import { CoverPattern } from "./post-card";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Large horizontal card for the newest post on page 1 of /blog. */
export function FeaturedPost({ post }: { post: PostSummary }) {
  const { blog, blogPage } = site;
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const category = post.categories[0];

  return (
    <article className="group card card-hover relative grid overflow-hidden md:grid-cols-[1.15fr_1fr]">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-brand-soft md:aspect-auto md:min-h-80 md:border-b-0 md:border-r">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 1152px) 600px, (min-width: 768px) 55vw, 100vw"
            className="object-cover"
          />
        ) : (
          <CoverPattern index={0} />
        )}
      </div>

      <div className="flex flex-col p-6 sm:p-8 md:p-10">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-accent px-3 py-1 font-semibold text-ink">{blogPage.featuredLabel}</span>
          {category ? (
            <span className="font-semibold uppercase tracking-[0.12em] text-brand-ink">{category.name}</span>
          ) : null}
        </p>
        <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.25rem)] leading-tight">
          <a
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[:focus-visible]:underline"
          >
            {post.title}
          </a>
        </h2>
        {post.excerpt ? <p className="mt-4 line-clamp-4 text-lg leading-relaxed text-muted">{post.excerpt}</p> : null}
        <p className="mt-6 text-sm text-muted md:mt-auto md:pt-8">
          {post.author?.name ?? blog.defaultAuthor}
          {date && !Number.isNaN(date.getTime()) ? (
            <>
              {" · "}
              <time dateTime={date.toISOString()}>{dateFormat.format(date)}</time>
            </>
          ) : null}
          {post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} ${blog.minReadSuffix}` : null}
        </p>
        <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 font-semibold text-brand-ink">
          {blog.readMoreLabel}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
