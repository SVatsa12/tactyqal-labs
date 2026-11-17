import { site } from "@/content/site";
import { Skeleton } from "@/components/ui/skeleton";
import { PostGridSkeleton } from "@/components/blog/post-card-skeleton";

export default function BlogLoading() {
  return (
    <>
      <div className="border-b border-border">
        <div className="container-page pb-14 pt-14 md:pb-20 md:pt-20">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-6 h-12 w-full max-w-2xl" />
          <Skeleton className="mt-3 h-12 w-2/3 max-w-xl" />
          <Skeleton className="mt-6 h-5 w-full max-w-xl" />
          <Skeleton className="mt-9 h-12 w-full max-w-xl rounded-full" />
          <div className="mt-7 flex gap-2">
            {["w-16", "w-28", "w-24", "w-32"].map((w) => (
              <Skeleton key={w} className={`h-9 rounded-full ${w}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="container-page py-14 md:py-20">
        <div className="card mb-5 grid overflow-hidden md:grid-cols-[1.15fr_1fr]">
          <Skeleton className="aspect-[16/9] rounded-none bg-brand-soft md:aspect-auto md:min-h-80" />
          <div className="p-6 sm:p-8 md:p-10">
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="mt-6 h-8 w-11/12" />
            <Skeleton className="mt-3 h-8 w-3/5" />
            <Skeleton className="mt-6 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
        </div>
        <PostGridSkeleton count={6} label={site.blogPage.loadingLabel} />
      </div>
    </>
  );
}
