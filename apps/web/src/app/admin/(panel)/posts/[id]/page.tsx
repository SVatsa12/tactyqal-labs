import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminFetch, adminSchemas } from "@/lib/admin/api";
import { deletePostAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Edit post" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditPostPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const [post, cats, tags] = await Promise.all([
    adminFetch(`/posts/${encodeURIComponent(id)}`, adminSchemas.post),
    adminFetch("/categories", adminSchemas.terms),
    adminFetch("/tags", adminSchemas.terms),
  ]);

  if (!post.ok) {
    if (post.status === 404) notFound();
    return <p role="alert">{post.error.message}</p>;
  }
  const p = post.data.data;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <a href="/admin" className="text-sm font-semibold text-muted hover:text-ink">← Posts</a>
        <DeleteButton action={deletePostAction} fields={{ id: p.id }} itemLabel={p.title} variant="text" />
      </div>
      <h1 className="mt-3 mb-8 line-clamp-2 text-3xl">{p.title}</h1>
      <PostForm
        key={p.updatedAt}
        created={sp.created === "1"}
        initial={{
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt ?? "",
          content: p.content,
          coverImageUrl: p.coverImageUrl ?? "",
          status: p.status ?? "DRAFT",
          publishedAt: p.publishedAt,
          seoTitle: p.seoTitle ?? "",
          seoDescription: p.seoDescription ?? "",
          categoryIds: p.categories.map((c) => c.id),
          tagIds: p.tags.map((t) => t.id),
        }}
        categories={cats.ok ? cats.data.data : []}
        tags={tags.ok ? tags.data.data : []}
      />
    </div>
  );
}
