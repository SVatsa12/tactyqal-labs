import type { Metadata } from "next";
import { adminFetch, adminSchemas } from "@/lib/admin/api";
import { deleteTermAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { TermForm } from "@/components/admin/term-form";
import type { Term } from "@/lib/api";

export const metadata: Metadata = { title: "Categories & tags" };

export default async function TaxonomyPage() {
  const [cats, tags] = await Promise.all([
    adminFetch("/categories", adminSchemas.terms),
    adminFetch("/tags", adminSchemas.terms),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl">Categories &amp; tags</h1>
      <p className="mt-1 text-muted">Counts show published posts.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <TermPanel
          title="Categories"
          kind="categories"
          label="category"
          terms={cats.ok ? cats.data.data : []}
          error={cats.ok ? undefined : cats.error.message}
        />
        <TermPanel
          title="Tags"
          kind="tags"
          label="tag"
          terms={tags.ok ? tags.data.data : []}
          error={tags.ok ? undefined : tags.error.message}
        />
      </div>
    </div>
  );
}

function TermPanel({
  title,
  kind,
  label,
  terms,
  error,
}: {
  title: string;
  kind: "categories" | "tags";
  label: string;
  terms: Term[];
  error?: string;
}) {
  return (
    <section aria-labelledby={`${kind}-title`} className="card p-5">
      <h2 id={`${kind}-title`} className="text-xl">
        {title} <span className="font-sans text-base font-normal text-muted">({terms.length})</span>
      </h2>
      <div className="mt-4">
        <TermForm kind={kind} label={label} />
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-muted">
          {error}
        </p>
      ) : (
        <ul className="mt-4 max-h-[28rem] divide-y divide-border overflow-y-auto">
          {terms.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{t.name}</p>
                <p className="truncate text-xs text-muted">
                  {t.slug} · {t.postCount ?? 0} posts
                </p>
              </div>
              <DeleteButton action={deleteTermAction} fields={{ kind, id: t.id }} itemLabel={t.name} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
