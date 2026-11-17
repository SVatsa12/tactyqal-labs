import type { Metadata } from "next";
import { adminFetch, adminSchemas } from "@/lib/admin/api";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  const [cats, tags] = await Promise.all([
    adminFetch("/categories", adminSchemas.terms),
    adminFetch("/tags", adminSchemas.terms),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <a href="/admin" className="text-sm font-semibold text-muted hover:text-ink">
        ← Posts
      </a>
      <h1 className="mt-3 mb-8 text-3xl">New post</h1>
      <PostForm
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImageUrl: "",
          status: "DRAFT",
          publishedAt: null,
          seoTitle: "",
          seoDescription: "",
          categoryIds: [],
          tagIds: [],
        }}
        categories={cats.ok ? cats.data.data : []}
        tags={tags.ok ? tags.data.data : []}
      />
    </div>
  );
}
