import { cn } from "@/lib/utils";

/** Flat CSS browser window. Decorative: the parent carries the accessible label. */
export function BrowserFrame({
  tab,
  className,
  children,
}: {
  tab: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "@container overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-lift",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-bg px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-medium text-muted @sm:text-[11px]">
          <span className="size-1.5 shrink-0 rounded-full bg-brand" />
          <span className="truncate">{tab}</span>
        </span>
      </div>
      {children}
    </div>
  );
}

/** Flat CSS phone with a notch and home indicator. */
export function PhoneFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("@container relative aspect-[9/18.5] rounded-[2rem] bg-ink p-[6px] shadow-lift", className)}>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[1.65rem] bg-surface">
        <div className="absolute left-1/2 top-1.5 h-3.5 w-[34%] -translate-x-1/2 rounded-full bg-ink" />
        <div className="flex flex-1 flex-col pt-6">{children}</div>
        <div className="mx-auto mb-1.5 h-1 w-1/3 rounded-full bg-ink/80" />
      </div>
    </div>
  );
}

/** Subtle dotted grid (SVG pattern, no gradients). */
export function DotGrid({ className }: { className?: string }) {
  const id = "dot-grid-pattern";
  return (
    <svg aria-hidden="true" className={cn("text-ink/15", className)} width="100%" height="100%">
      <defs>
        <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
