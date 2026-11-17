import type { Metadata } from "next";
import { z } from "zod";
import { adminFetch, adminSchemas } from "@/lib/admin/api";
import { Pagination } from "@/components/blog/pagination";

export const metadata: Metadata = { title: "Leads" };

const spSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLeadsPage({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;
  const { page } = spSchema.parse({ page: Array.isArray(raw.page) ? raw.page[0] : raw.page });
  const res = await adminFetch(`/leads?page=${page}&limit=20`, adminSchemas.leadList);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl">Leads</h1>
      <p className="mt-1 text-muted">
        Messages from the homepage contact form
        {res.ok ? ` · ${res.data.meta.total} total` : null}
      </p>

      {!res.ok ? (
        <p role="alert" className="mt-8 text-muted">
          {res.error.message}
        </p>
      ) : res.data.data.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-14 text-center">
          <p className="font-semibold">No leads yet.</p>
          <p className="mt-1 text-sm text-muted">New contact-form messages will show up here.</p>
        </div>
      ) : (
        <>
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Email</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Phone</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Message</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {res.data.data.map((lead) => (
                  <tr key={lead.id} className="align-top hover:bg-bg">
                    <td className="px-5 py-3.5 font-semibold">{lead.name}</td>
                    <td className="px-3 py-3.5">
                      <a href={`mailto:${lead.email}`} className="hover:text-brand-ink hover:underline underline-offset-4">
                        {lead.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="hover:text-ink">
                          {lead.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="max-w-[22rem] px-3 py-3.5">
                      <p className="line-clamp-2 text-muted" title={lead.message}>
                        {lead.message}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted">
                      <time dateTime={lead.createdAt}>{dateFmt.format(new Date(lead.createdAt))}</time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={res.data.meta.page}
            totalPages={res.data.meta.totalPages}
            hrefFor={(n) => (n > 1 ? `/admin/leads?page=${n}` : "/admin/leads")}
          />
        </>
      )}
    </div>
  );
}
