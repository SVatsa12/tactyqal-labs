import type { MockupKind } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * A flat, CSS-only phone with an abstract app screen.
 * Decorative: hidden from assistive tech (the story text carries the meaning).
 */
export function PhoneMockup({
  kind,
  appName,
  className,
}: {
  kind: MockupKind;
  appName: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative aspect-[9/18.5] w-full rounded-[2.25rem] bg-ink p-[7px] shadow-lift",
        className,
      )}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[1.85rem] bg-surface">
        {/* notch */}
        <div className="absolute left-1/2 top-2 h-[18px] w-[34%] -translate-x-1/2 rounded-full bg-ink" />
        {/* status bar */}
        <div className="flex items-center justify-between px-5 pt-2.5 text-[9px] font-semibold text-ink">
          <span>9:41</span>
          <span className="flex gap-0.5">
            <span className="h-1.5 w-3 rounded-sm bg-ink" />
          </span>
        </div>
        {/* app bar */}
        <div className="mt-5 flex items-center gap-2 px-4">
          <span className="grid size-7 place-items-center rounded-lg bg-brand font-display text-xs font-bold text-ink">
            {appName.charAt(0)}
          </span>
          <span className="truncate font-display text-[13px] font-bold tracking-tight text-ink">{appName}</span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-4">
          <Screen kind={kind} />
        </div>
        {/* home indicator */}
        <div className="mx-auto mb-2 h-1 w-1/3 rounded-full bg-ink/80" />
      </div>
    </div>
  );
}

const Bar = ({ className }: { className?: string }) => (
  <span className={cn("block h-2 rounded-full bg-border", className)} />
);

function Screen({ kind }: { kind: MockupKind }) {
  switch (kind) {
    case "insights":
      return (
        <>
          <div className="rounded-2xl bg-brand-soft p-3">
            <Bar className="w-1/2 bg-brand/40" />
            <div className="mt-3 flex h-16 items-end gap-1.5">
              {[45, 70, 38, 88, 60, 76, 52].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className={cn("flex-1 rounded-t-md", i === 3 ? "bg-brand" : "bg-brand/35")}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border p-2.5">
              <span className="block size-4 rounded-full bg-accent" />
              <Bar className="mt-2 w-3/4" />
            </div>
            <div className="rounded-xl border border-border p-2.5">
              <span className="block size-4 rounded-full bg-ink" />
              <Bar className="mt-2 w-2/3" />
            </div>
          </div>
          <div className="mt-auto rounded-full bg-ink py-2 text-center">
            <Bar className="mx-auto w-1/3 bg-white/70" />
          </div>
        </>
      );
    case "shop":
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            {["bg-brand-soft", "bg-accent/50", "bg-border", "bg-brand/25"].map((bg, i) => (
              <div key={i} className="rounded-xl border border-border p-1.5">
                <div className={cn("grid aspect-square place-items-center rounded-lg", bg)}>
                  <span className="block h-1/2 w-1/2 rounded-t-[40%] rounded-b-md border-[3px] border-ink/70" />
                </div>
                <Bar className="mt-1.5 w-3/4" />
                <Bar className="mt-1 w-1/3 bg-brand/50" />
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-full bg-brand py-2 text-center">
            <Bar className="mx-auto w-1/3 bg-ink/60" />
          </div>
        </>
      );
    case "subscription":
      return (
        <>
          <div className="flex gap-1.5">
            {["bg-brand", "bg-accent", "bg-ink", "bg-brand/40"].map((bg, i) => (
              <span key={i} className={cn("h-20 flex-1 rounded-md", bg)} />
            ))}
          </div>
          <div className="rounded-2xl border border-border p-3">
            <Bar className="w-1/2 bg-ink/70" />
            <Bar className="mt-2 w-5/6" />
            <Bar className="mt-1.5 w-2/3" />
          </div>
          <div className="rounded-2xl bg-brand-soft p-3">
            <div className="flex items-center justify-between">
              <Bar className="w-1/3 bg-brand/50" />
              <span className="h-4 w-8 rounded-full bg-brand" />
            </div>
          </div>
        </>
      );
    case "pets":
      return (
        <>
          <div className="relative grid aspect-[4/3] place-items-center rounded-2xl bg-accent/45">
            <PawPrint />
          </div>
          <Bar className="w-2/3 bg-ink/70" />
          <Bar className="w-1/2" />
          <div className="mt-auto flex justify-center gap-4">
            <span className="grid size-10 place-items-center rounded-full border border-border">
              <span className="block size-3 rotate-45 rounded-[2px] bg-border" />
            </span>
            <span className="grid size-10 place-items-center rounded-full bg-brand">
              <span className="block size-3 rounded-full bg-ink" />
            </span>
          </div>
        </>
      );
    case "media":
      return (
        <>
          <div className="grid aspect-square place-items-center rounded-2xl bg-ink">
            <div className="flex h-10 items-center gap-1">
              {[30, 60, 90, 50, 75, 40, 85, 55, 35].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className={cn("w-1.5 rounded-full", i % 3 === 0 ? "bg-accent" : "bg-brand")}
                />
              ))}
            </div>
          </div>
          <Bar className="w-2/3 bg-ink/70" />
          <div className="h-1 rounded-full bg-border">
            <span className="block h-full w-2/5 rounded-full bg-brand" />
          </div>
          <div className="mt-auto flex items-center justify-center gap-3">
            <span className="block size-3 rounded-full bg-border" />
            <span className="grid size-9 place-items-center rounded-full bg-brand">
              <span className="ml-0.5 block size-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-ink" />
            </span>
            <span className="block size-3 rounded-full bg-border" />
          </div>
        </>
      );
    case "chat":
      return (
        <>
          <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-brand-soft p-2.5">
            <Bar className="w-full bg-brand/40" />
            <Bar className="mt-1.5 w-2/3 bg-brand/40" />
          </div>
          <div className="ml-auto max-w-[70%] rounded-2xl rounded-tr-md bg-ink p-2.5">
            <Bar className="w-full bg-white/50" />
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-brand-soft p-2.5">
            <Bar className="w-full bg-brand/40" />
            <Bar className="mt-1.5 w-1/2 bg-brand/40" />
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-full border border-border p-1.5 pl-3">
            <Bar className="flex-1" />
            <span className="size-6 rounded-full bg-brand" />
          </div>
        </>
      );
  }
}

function PawPrint() {
  return (
    <svg viewBox="0 0 64 64" className="size-1/2">
      <ellipse cx="32" cy="42" rx="13" ry="11" className="fill-brand" />
      <ellipse cx="17" cy="28" rx="5.5" ry="7" className="fill-brand" />
      <ellipse cx="27" cy="19" rx="5.5" ry="7.5" className="fill-brand" />
      <ellipse cx="38" cy="19" rx="5.5" ry="7.5" className="fill-brand" />
      <ellipse cx="48" cy="28" rx="5.5" ry="7" className="fill-brand" />
    </svg>
  );
}
