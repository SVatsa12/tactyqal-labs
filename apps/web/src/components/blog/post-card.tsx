import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";

export type PostCardData = {
  title: string;
  excerpt: string | null;
  href: string;
  external: boolean;
  coverImageUrl: string | null;
  publishedAt: string | null;
  readMinutes: number | null;
  authorName: string | null;
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function PostCard({ post, index }: { post: PostCardData; index: number }) {
  const { blog, a11y } = site;
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const validDate = date && !Number.isNaN(date.getTime()) ? date : null;

  return (
    <article className="group card card-hover relative flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-brand-soft">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <CoverPattern index={index} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm text-muted">
          {post.authorName ?? blog.defaultAuthor}
          {validDate ? (
            <>
              {" · "}
              <time dateTime={validDate.toISOString()}>{dateFormat.format(validDate)}</time>
            </>
          ) : null}
          {post.readMinutes ? ` · ${post.readMinutes} ${blog.minReadSuffix}` : null}
        </p>
        <h3 className="mt-3 text-xl leading-snug">
          <a
            href={post.href}
            target={post.external ? "_blank" : undefined}
            rel={post.external ? "noopener noreferrer" : undefined}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[:focus-visible]:underline"
          >
            {post.title}
            {post.external ? <span className="sr-only"> {a11y.opensInNewTab}</span> : null}
          </a>
        </h3>
        {post.excerpt ? (
          <p className="mt-2.5 line-clamp-3 flex-1 leading-relaxed text-muted">{post.excerpt}</p>
        ) : (
          <span className="flex-1" />
        )}
        <span
          aria-hidden="true"
          className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-brand-ink"
        >
          {blog.readMoreLabel}
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

/** Flat geometric cover for posts without an image. */
function CoverPattern({ index }: { index: number }) {
  const variant = index % 3;
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <rect width="320" height="180" className="fill-brand-soft" />
      {variant === 0 ? (
        <>
          <circle cx="250" cy="40" r="70" className="fill-brand" />
          <rect x="40" y="96" width="120" height="44" rx="22" className="fill-accent" />
          <rect x="40" y="56" width="70" height="12" rx="6" className="fill-ink" />
        </>
      ) : variant === 1 ? (
        <>
          <rect x="30" y="30" width="90" height="90" rx="20" className="fill-accent" />
          <circle cx="200" cy="120" r="48" className="fill-none stroke-ink" strokeWidth="3" />
          <circle cx="270" cy="60" r="18" className="fill-brand" />
        </>
      ) : (
        <>
          <path d="M0 180 L120 60 L200 140 L260 90 L320 150 V180Z" className="fill-brand" />
          <circle cx="70" cy="50" r="22" className="fill-accent" />
          <rect x="220" y="28" width="64" height="12" rx="6" className="fill-ink" />
        </>
      )}
    </svg>
  );
}
