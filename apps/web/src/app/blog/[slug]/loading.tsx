import { site } from "@/content/site";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostLoading() {
  return (
    <div role="status" aria-label={site.blogPage.loadingLabel}>
      <div className="container-page max-w-3xl pb-10 pt-12 md:pt-16">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-10 h-4 w-32" />
        <Skeleton className="mt-5 h-11 w-full" />
        <Skeleton className="mt-3 h-11 w-3/4" />
        <Skeleton className="mt-6 h-5 w-full" />
        <div className="mt-7 flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="container-page max-w-4xl">
        <Skeleton className="aspect-[16/9] rounded-[var(--radius-panel)] bg-brand-soft" />
      </div>
      <div className="container-page max-w-3xl space-y-3 py-12 md:py-16">
        {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"].map((w, i) => (
          <Skeleton key={i} className={`h-4 ${w}`} />
        ))}
      </div>
    </div>
  );
}
