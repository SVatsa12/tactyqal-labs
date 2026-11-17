import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { getLatestPosts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/fade-up";
import { SectionHeading } from "@/components/ui/section-heading";
import { PostCard, type PostCardData } from "@/components/blog/post-card";
import { isExternal } from "@/lib/utils";

/** "From the blog": reads live from our API, falls back to static posts if it is down. */
export async function BlogPreview() {
  const { blog, a11y } = site;
  const apiPosts = await getLatestPosts(blog.limit);

  const posts: PostCardData[] =
    apiPosts && apiPosts.length > 0
      ? apiPosts.map((p) => ({
          title: p.title,
          excerpt: p.excerpt,
          href: `/blog/${p.slug}`,
          external: false,
          coverImageUrl: p.coverImageUrl,
          publishedAt: p.publishedAt,
          readMinutes: p.readingTimeMinutes ?? null,
          authorName: p.author?.name ?? null,
        }))
      : blog.fallbackPosts.slice(0, blog.limit).map((p) => ({
          title: p.title,
          excerpt: p.excerpt,
          href: p.href,
          external: true,
          coverImageUrl: null,
          publishedAt: p.publishedAt,
          readMinutes: p.readMinutes,
          authorName: null,
        }));

  // Once the API is live, "Read all" points at our own /blog.
  const allHref = apiPosts && apiPosts.length > 0 ? "/blog" : blog.allPostsCta.href;
  const allExternal = isExternal(allHref);

  return (
    <section id={blog.id} aria-labelledby="blog-title" className="section-y">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            id="blog-title"
            eyebrow={blog.eyebrow}
            title={blog.title}
            description={blog.description}
          />
          <FadeUp>
            <Button asChild variant="secondary">
              <a
                href={allHref}
                target={allExternal ? "_blank" : undefined}
                rel={allExternal ? "noopener noreferrer" : undefined}
              >
                {blog.allPostsCta.label}
                <ArrowRight aria-hidden="true" />
                {allExternal ? <span className="sr-only"> {a11y.opensInNewTab}</span> : null}
              </a>
            </Button>
          </FadeUp>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <FadeUp as="li" key={post.href} delay={i * 0.06}>
              <PostCard post={post} index={i} />
            </FadeUp>
          ))}
        </ul>
      </div>
    </section>
  );
}
