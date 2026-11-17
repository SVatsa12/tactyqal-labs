import { cn } from "@/lib/utils";

/** Placeholder block. Pulses unless the user prefers reduced motion. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block animate-pulse rounded-lg bg-border/70 motion-reduce:animate-none", className)}
    />
  );
}
