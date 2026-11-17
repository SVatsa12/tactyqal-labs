import { cn } from "@/lib/utils";

export const inputCls =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-[0.9375rem] text-ink placeholder:text-muted transition-colors focus-visible:border-ink/40 aria-[invalid=true]:border-brand";

export const textareaCls =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[0.9375rem] leading-relaxed text-ink placeholder:text-muted transition-colors focus-visible:border-ink/40 aria-[invalid=true]:border-brand";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm font-medium text-brand-ink">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
