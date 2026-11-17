import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Same footprint as PostCard, for loading states. */
export function PostCardSkeleton() {
  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <Skeleton className="aspect-[16/9] rounded-none border-b border-border bg-brand-soft" />
      <div className="flex flex-1 flex-col p-6">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="mt-4 h-5 w-11/12" />
        <Skeleton className="mt-2 h-5 w-3/5" />
        <Skeleton className="mt-4 h-3.5 w-full" />
        <Skeleton className="mt-2 h-3.5 w-4/5" />
        <Skeleton className="mt-6 h-4 w-24" />
      </div>
    </div>
  );
}

/** A labelled grid of card skeletons. */
export function PostGridSkeleton({ count, label, className }: { count: number; label: string; className?: string }) {
  return (
    <div role="status" aria-label={label} className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
