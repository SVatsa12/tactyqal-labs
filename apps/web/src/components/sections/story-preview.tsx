import { Heart, Play } from "lucide-react";
import type { PreviewKind } from "@/content/site";
import { cn } from "@/lib/utils";

/** A small, flat, CSS-only UI hint for each student app. Decorative. */
export function StoryPreview({ kind, className }: { kind: PreviewKind; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative grid place-items-center overflow-hidden bg-brand-soft p-6", className)}
    >
      {previews[kind]}
    </div>
  );
}

const Line = ({ className }: { className?: string }) => (
  <span className={cn("block h-1.5 rounded-full bg-border", className)} />
);

const previews: Record<PreviewKind, React.ReactNode> = {
  // KrishiDrishti: crop chart
  crops: (
    <div className="w-full max-w-[13rem] rounded-xl border border-border bg-surface p-3 shadow-soft">
      <div className="flex items-center justify-between">
        <Line className="w-16 bg-ink/70" />
        <span className="size-4 rounded-full bg-accent" />
      </div>
      <div className="mt-3 flex h-16 items-end gap-1.5">
        {[38, 62, 48, 84, 56, 72].map((h, i) => (
          <span
            key={i}
            className={cn("flex-1 rounded-t", i === 3 ? "bg-brand" : "bg-brand/30")}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="h-1 w-3 rounded-full bg-border" />
        ))}
      </div>
    </div>
  ),

  // Elenor: product tiles
  shop: (
    <div className="grid w-full max-w-[17rem] grid-cols-3 gap-2.5">
      {["bg-surface", "bg-accent/60", "bg-surface"].map((bg, i) => (
        <div key={i} className={cn("rounded-xl border border-border p-2 shadow-soft", bg)}>
          <div className="grid aspect-square place-items-center rounded-lg bg-brand-soft">
            <span className="relative block h-[44%] w-[56%] rounded-b-md rounded-t-sm bg-brand">
              <span className="absolute -top-[45%] left-1/2 h-[55%] w-[55%] -translate-x-1/2 rounded-t-full border-[2.5px] border-b-0 border-ink/70" />
            </span>
          </div>
          <Line className="mt-2 w-4/5" />
          <Line className={cn("mt-1 w-1/2", i === 1 ? "bg-ink/60" : "bg-brand/50")} />
        </div>
      ))}
    </div>
  ),

  // One Last Chapter: book stack + monthly box
  books: (
    <div className="flex w-full max-w-[17rem] items-end justify-center gap-4">
      <div className="flex flex-col items-center gap-1">
        {[
          "w-20 bg-brand",
          "w-[4.5rem] bg-ink",
          "w-[5.5rem] bg-accent",
          "w-[4.75rem] bg-surface border border-border",
          "w-20 bg-brand/40",
        ].map((cls, i) => (
          <span key={i} className={cn("flex h-4 items-center rounded-sm px-2", cls)}>
            <span className="h-1 w-6 rounded-full bg-white/60" />
          </span>
        ))}
      </div>
      <div className="w-16 shrink-0 rounded-xl border border-border bg-surface p-2 shadow-soft">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={cn("aspect-square rounded-[3px]", i === 5 ? "bg-brand" : "bg-bg")} />
          ))}
        </div>
        <Line className="mt-2 w-3/4 bg-ink/60" />
      </div>
    </div>
  ),

  // Paws of Promise: adopt card
  pets: (
    <div className="w-full max-w-[11rem] rounded-xl border border-border bg-surface p-2.5 shadow-soft">
      <div className="grid aspect-[4/3] place-items-center rounded-lg bg-accent/50">
        <svg viewBox="0 0 64 64" className="size-1/2">
          <ellipse cx="32" cy="42" rx="13" ry="11" className="fill-brand" />
          <ellipse cx="17" cy="28" rx="5.5" ry="7" className="fill-brand" />
          <ellipse cx="27" cy="19" rx="5.5" ry="7.5" className="fill-brand" />
          <ellipse cx="38" cy="19" rx="5.5" ry="7.5" className="fill-brand" />
          <ellipse cx="48" cy="28" rx="5.5" ry="7" className="fill-brand" />
        </svg>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="space-y-1">
          <Line className="w-14 bg-ink/70" />
          <Line className="w-9" />
        </span>
        <span className="grid size-7 place-items-center rounded-full bg-brand text-ink">
          <Heart className="size-3.5 fill-current" />
        </span>
      </div>
    </div>
  ),

  // AudioNova: waveform player
  media: (
    <div className="w-full max-w-[13rem] rounded-xl bg-ink p-3.5 shadow-soft">
      <div className="flex h-12 items-center gap-[3px]">
        {[30, 55, 80, 45, 95, 60, 35, 70, 90, 50, 65, 40, 85, 55, 30].map((h, i) => (
          <span
            key={i}
            className={cn("flex-1 rounded-full", i < 6 ? "bg-brand" : "bg-white/25")}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-full bg-accent text-ink">
          <Play className="ml-0.5 size-3.5 fill-current" />
        </span>
        <span className="h-1 flex-1 rounded-full bg-white/20">
          <span className="block h-full w-2/5 rounded-full bg-brand" />
        </span>
      </div>
    </div>
  ),

  // Converza: chat bubbles
  chat: (
    <div className="flex w-full max-w-[13rem] flex-col gap-2">
      <div className="flex items-end gap-1.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand font-display text-[10px] font-bold text-ink">
          L
        </span>
        <div className="rounded-2xl rounded-bl-md border border-border bg-surface p-2.5 shadow-soft">
          <Line className="w-24 bg-ink/60" />
          <Line className="mt-1.5 w-16" />
        </div>
      </div>
      <div className="ml-auto rounded-2xl rounded-br-md bg-ink p-2.5">
        <Line className="w-20 bg-white/50" />
      </div>
      <div className="flex items-end gap-1.5">
        <span className="size-6 shrink-0" />
        <div className="rounded-2xl rounded-bl-md border border-border bg-surface p-2.5 shadow-soft">
          <Line className="w-20 bg-ink/60" />
        </div>
      </div>
    </div>
  ),
};
