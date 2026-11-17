import { cn } from "@/lib/utils";

/** Wordmark with a flat geometric mark (no image asset needed). */
export function Logo({ name, inverse = false }: { name: string; inverse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-brand" />
        <path d="M9 10.5h14v3.6h-5.2V23h-3.6v-8.9H9z" className="fill-ink" />
        <circle cx="22.5" cy="21.5" r="2.2" className="fill-accent" />
      </svg>
      <span
        className={cn(
          "font-display text-lg font-bold tracking-tight",
          inverse ? "text-white" : "text-ink",
        )}
      >
        {name}
      </span>
    </span>
  );
}
