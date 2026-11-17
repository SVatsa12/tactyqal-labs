import Link from "next/link";
import type { Metadata } from "next";
import { Pencil, Search } from "lucide-react";
import { z } from "zod";
import { adminFetch, adminSchemas } from "@/lib/admin/api";
import { deletePostAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/blog/pagination";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Posts" };

const spSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1).default(1),
  status: z.enum(["all", "published", "draft"]).catch("all").default("all"),
  q: z.string().trim().max(100).optional().catch(undefined),
  deleted: z.string().optional(),
});

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPostsPage({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;
  const { page, status, q, deleted } = spSchema.parse(
    Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])),
  );

  const qs = new URLSearchParams({ page: String(page), limit: "20", status });
  if (q) qs.set("q", q);
  const res = await adminFetch(`/posts?${qs.toString()}`, adminSchemas.postList);

  const href = (next: { page?: number; status?: string }) => {
    const p = new URLSearchParams();
    const s = next.status ?? status;
    if (s !== "all") p.set("status", s);
    if (q) p.set("q", q);
    if (next.page && next.page > 1) p.set("page", String(next.page));
    const str = p.toString();
    return str ? `/admin?${str}` : "/admin";
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Posts</h1>
          {res.ok ? <p className="mt-1 text-muted">{res.data.meta.total} total</p> : null}
        </div>
        <form action="/admin" method="get" role="search" className="relative w-full sm:w-72">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="admin-search" className="sr-only">
            Search posts
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="admin-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search titles…"
            className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-4 text-sm"
          />
        </form>
      </div>

      {deleted ? (
        <p role="status" className="mt-6 rounded-xl bg-brand-soft px-4 py-3 text-sm">
          Post deleted.
        </p>
      ) : null}

      <nav aria-label="Filter by status" className="mt-6 flex gap-1 border-b border-border">
        {(["all", "published", "draft"] as const).map((s) => (
          <a
            key={s}
            href={href({ status: s })}
            aria-current={status === s ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold capitalize transition-colors",
              status === s ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {s}
          </a>
        ))}
      </nav>

      {!res.ok ? (
        <p role="alert" className="mt-8 text-muted">
          {res.error.message}
        </p>
      ) : res.data.data.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-14 text-center">
          <p className="font-semibold">No posts here yet.</p>
          <Link href="/admin/posts/new" className="mt-2 inline-block font-semibold text-brand-ink underline underline-offset-4">
            Write the first one
          </Link>
        </div>
      ) : (
        <>
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Title</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Published</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Updated</th>
                  <th scope="col" className="px-3 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {res.data.data.map((p) => (
                  <tr key={p.id} className="hover:bg-bg">
                    <td className="max-w-[26rem] px-5 py-3.5">
                      <a href={`/admin/posts/${p.id}`} className="line-clamp-1 font-semibold hover:text-brand-ink">
                        {p.title}
                      </a>
                      <p className="mt-0.5 truncate text-xs text-muted">/blog/{p.slug}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          p.status === "PUBLISHED" ? "bg-brand-soft text-brand-ink" : "bg-bg text-muted ring-1 ring-border",
                        )}
                      >
                        {p.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">
                      {p.publishedAt ? dateFmt.format(new Date(p.publishedAt)) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">
                      {p.updatedAt ? dateFmt.format(new Date(p.updatedAt)) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <a
                          href={`/admin/posts/${p.id}`}
                          aria-label={`Edit “${p.title}”`}
                          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-bg hover:text-ink"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </a>
                        <DeleteButton action={deletePostAction} fields={{ id: p.id }} itemLabel={p.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={res.data.meta.page}
            totalPages={res.data.meta.totalPages}
            hrefFor={(n) => href({ page: n })}
          />
        </>
      )}
    </div>
  );
}
