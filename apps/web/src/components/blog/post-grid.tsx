import type { PostSummary } from "@/lib/api";
import { FadeUp } from "@/components/ui/fade-up";
import { PostCard, type PostCardData } from "./post-card";

export function toCardData(p: PostSummary): PostCardData {
  return {
    title: p.title,
    excerpt: p.excerpt,
    href: `/blog/${p.slug}`,
    external: false,
    coverImageUrl: p.coverImageUrl,
    publishedAt: p.publishedAt,
    readMinutes: p.readingTimeMinutes ?? null,
    authorName: p.author?.name ?? null,
  };
}

export function PostGrid({ posts }: { posts: PostSummary[] }) {
  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, i) => (
        <FadeUp as="li" key={post.id} delay={(i % 3) * 0.05}>
          <PostCard post={toCardData(post)} index={i} />
        </FadeUp>
      ))}
    </ul>
  );
}
