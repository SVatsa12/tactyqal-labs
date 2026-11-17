import { Sprout, TrendingUp } from "lucide-react";
import { site } from "@/content/site";
import { BrowserFrame, DotGrid, PhoneFrame } from "@/components/ui/device-frames";
import { cn } from "@/lib/utils";

/**
 * CSS-only composition: KrishiDrishti dashboard in a browser, Converza chat on a
 * phone, and a floating revenue card. One accessible label; the pieces are decorative.
 */
export function HeroVisual() {
  const { visual } = site.hero;

  return (
    <div role="img" aria-label={visual.label} className="relative mx-auto aspect-[10/9] w-full max-w-[34rem]">
      <div className="absolute inset-x-[6%] inset-y-0 overflow-hidden rounded-[var(--radius-panel)]">
        <DotGrid />
      </div>
      <span className="absolute right-[2%] top-[2%] size-14 rounded-2xl bg-accent md:size-16" />

      <BrowserFrame tab={visual.browser.tab} className="absolute left-0 top-[7%] w-[79%]">
        <Dashboard />
      </BrowserFrame>

      <PhoneFrame className="absolute bottom-0 right-0 w-[31%] rotate-[4deg]">
        <Chat />
      </PhoneFrame>

      <div className="card absolute bottom-[5%] left-[3%] flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink sm:size-10">
          <TrendingUp className="size-4 sm:size-5" aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-sm font-bold tracking-tight sm:text-base">
            {visual.floating.value}
          </span>
          <span className="block text-[11px] text-muted sm:text-xs">{visual.floating.caption}</span>
        </span>
      </div>
    </div>
  );
}

function Dashboard() {
  const b = site.hero.visual.browser;
  const maxMoisture = Math.max(...b.moisture);

  return (
    <div className="space-y-2.5 p-3 @sm:space-y-3 @sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-brand font-display text-[11px] font-bold text-ink @sm:size-7 @sm:text-xs">
            {b.tab.charAt(0)}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-xs font-bold tracking-tight @sm:text-sm">{b.title}</span>
            <span className="block text-[10px] text-muted">{b.subtitle}</span>
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand-ink">
          <span className="size-1.5 rounded-full bg-brand" />
          {b.status}
        </span>
      </div>

      <div className="grid grid-cols-[1.25fr_1fr] gap-2 @sm:gap-2.5">
        <div className="rounded-xl border border-border p-2.5">
          <p className="text-[10px] font-semibold text-muted">{b.nutrientsTitle}</p>
          <ul className="mt-2 space-y-1.5">
            {b.nutrients.map((n) => (
              <li key={n.label}>
                <span className="block text-[10px] text-ink">{n.label}</span>
                <span className="mt-0.5 block h-1.5 rounded-full bg-bg">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${n.value}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col rounded-xl bg-ink p-2.5 text-white">
          <p className="text-[10px] font-semibold text-on-ink-muted">{b.cropTitle}</p>
          <Sprout className="mt-2 size-5 text-accent" aria-hidden="true" />
          <p className="mt-auto font-display text-base font-bold tracking-tight @sm:text-lg">{b.crop}</p>
          <p className="text-[10px] leading-snug text-on-ink-muted">{b.cropNote}</p>
        </div>
      </div>

      <div className="hidden rounded-xl border border-border p-2.5 @sm:block">
        <p className="text-[10px] font-semibold text-muted">{b.moistureTitle}</p>
        <div className="mt-2 flex h-9 items-end gap-1 @sm:h-12">
          {b.moisture.map((m, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-t", i === b.moisture.indexOf(maxMoisture) ? "bg-brand" : "bg-brand-soft")}
              style={{ height: `${Math.round((m / maxMoisture) * 100)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Chat() {
  const p = site.hero.visual.phone;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1.5 border-b border-border px-2.5 pb-2">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand font-display text-[9px] font-bold text-ink @[9rem]:size-6 @[9rem]:text-[10px]">
          {p.botName.charAt(0)}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[9px] font-bold @[9rem]:text-[10px]">{p.botName}</span>
          <span className="block truncate text-[8px] text-muted @[9rem]:text-[9px]">
            {p.appName} · {p.botStatus}
          </span>
        </span>
      </div>
      <ul className="flex flex-1 flex-col gap-1.5 px-2 py-2.5">
        {p.messages.map((m, i) => (
          <li
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-2 py-1.5 text-[8px] leading-snug @[9rem]:text-[9.5px]",
              m.from === "bot" ? "rounded-tl-md bg-brand-soft text-ink" : "ml-auto rounded-tr-md bg-ink text-white",
            )}
          >
            {m.text}
          </li>
        ))}
      </ul>
      <div className="mx-2 mb-2 flex items-center gap-1.5 rounded-full border border-border py-1 pl-2.5 pr-1">
        <span className="flex-1 truncate text-[8px] text-muted @[9rem]:text-[9px]">{p.inputPlaceholder}</span>
        <span className="size-4 shrink-0 rounded-full bg-brand @[9rem]:size-5" />
      </div>
    </div>
  );
}
