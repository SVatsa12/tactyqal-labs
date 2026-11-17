import type * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Native <details> accordion: no JavaScript, answers are in the server HTML, and items that
 * share a `name` behave as a single-open group in current browsers.
 */
export function AccordionItem({
  name,
  question,
  open,
  children,
  className,
}: {
  name: string;
  question: React.ReactNode;
  open?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details name={name} open={open} className={cn("group card overflow-hidden open:border-ink/15", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-left font-display text-lg font-semibold tracking-tight focus-visible:outline-offset-[-2px] [&::-webkit-details-marker]:hidden">
        {question}
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink transition-transform duration-200 group-open:rotate-45"
        >
          <Plus className="size-4" />
        </span>
      </summary>
      <div className="px-6 pb-6 leading-relaxed text-muted">{children}</div>
    </details>
  );
}
