import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { getLatestPosts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/fade-up";
import { SectionHeading } from "@/components/ui/section-heading";
import { PostCard } from "@/components/blog/post-card";
import { PostGridSkeleton } from "@/components/blog/post-card-skeleton";
import { toCardData } from "@/components/blog/post-grid";

/** "From the blog": reads live from our API; skeleton cards while loading or if it is down. */
export function BlogPreview() {
  const { blog } = site;

  return (
    <section id={blog.id} aria-labelledby="blog-title" className="section-y">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading id="blog-title" eyebrow={blog.eyebrow} title={blog.title} description={blog.description} />
          <FadeUp>
            <Button asChild variant="secondary">
              <a href={blog.allPostsCta.href}>
                {blog.allPostsCta.label}
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          </FadeUp>
        </div>

        <Suspense fallback={<PostGridSkeleton count={blog.limit} label={blog.loadingLabel} className="mt-14" />}>
          <LatestPosts />
        </Suspense>
      </div>
    </section>
  );
}

async function LatestPosts() {
  const { blog } = site;
  const posts = await getLatestPosts(blog.limit);

  if (!posts || posts.length === 0) {
    return (
      <div className="mt-14">
        <PostGridSkeleton count={blog.limit} label={blog.loadingLabel} />
        <p className="mt-6 text-center text-muted">{blog.unavailable}</p>
      </div>
    );
  }

  return (
    <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, i) => (
        <FadeUp as="li" key={post.id} delay={i * 0.06}>
          <PostCard post={toCardData(post)} index={i} />
        </FadeUp>
      ))}
    </ul>
  );
}
