import { ArrowLeft, ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  /** Builds the href for a given page number. */
  hrefFor: (page: number) => string;
};

export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;
  const { blogPage: t } = site;
  const linkCls =
    "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-[0.9375rem] font-semibold transition-colors hover:border-ink/25";
  const disabledCls = "pointer-events-none opacity-40";

  return (
    <nav aria-label={t.paginationLabel} className="mt-14 flex items-center justify-between gap-4">
      {page > 1 ? (
        <a href={hrefFor(page - 1)} rel="prev" className={linkCls}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.prev}
        </a>
      ) : (
        <span aria-hidden="true" className={cn(linkCls, disabledCls)}>
          <ArrowLeft className="size-4" />
          {t.prev}
        </span>
      )}

      <p className="text-sm text-muted" aria-current="page">
        {t.pageLabel} {page} {t.ofLabel} {totalPages}
      </p>

      {page < totalPages ? (
        <a href={hrefFor(page + 1)} rel="next" className={linkCls}>
          {t.next}
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      ) : (
        <span aria-hidden="true" className={cn(linkCls, disabledCls)}>
          {t.next}
          <ArrowRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
