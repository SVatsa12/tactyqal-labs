"use client";

import * as React from "react";
import type { TimelineStep } from "@/content/site";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * 4-step track: horizontal from md, vertical on mobile. The brand line fills as the list
 * scrolls from 80% to 55% of the viewport. Server HTML (so also no-JS) and reduced motion
 * show it complete and static.
 */
export function TimelineTrack({ steps }: { steps: TimelineStep[] }) {
  const ref = React.useRef<HTMLOListElement>(null);
  const [progress, setProgress] = React.useState(1);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const measure = () => {
      frame = 0;
      if (reduce.matches) return setProgress(1);
      const { top, height } = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the top reaches 80% of the viewport, 1 when the bottom reaches 55%.
      setProgress(clamp01((vh * 0.8 - top) / (vh * 0.25 + height)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduce.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduce.removeEventListener("change", schedule);
    };
  }, []);

  const last = steps.length - 1;
  // Step i lights up once the line reaches it (steps sit at 0, 1/3, 2/3, 1).
  const reached = Math.min(steps.length, Math.floor(progress * last + 0.001) + 1);

  return (
    <ol ref={ref} className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
      {/* Desktop: horizontal track from the first to the last icon */}
      <span
        aria-hidden="true"
        className="absolute left-7 top-7 hidden h-0.5 -translate-y-1/2 bg-border md:block"
        style={{ right: "calc((100% - 4.5rem) / 4 - 1.75rem)" }}
      >
        <span className="block h-full w-full origin-left bg-brand" style={{ transform: `scaleX(${progress})` }} />
      </span>

      {steps.map((step, i) => {
        const lit = i < reached;
        return (
          <li key={step.weeks} className="relative flex gap-5 md:block">
            {i < last ? (
              // Mobile only: a line from this icon to the next one, filling in turn.
              <span
                aria-hidden="true"
                className="absolute left-7 top-7 h-[calc(100%+2.5rem)] w-0.5 -translate-x-1/2 bg-border md:hidden"
              >
                <span
                  className="block h-full w-full origin-top bg-brand"
                  style={{ transform: `scaleY(${clamp01(progress * last - i)})` }}
                />
              </span>
            ) : null}
            <div
              className={cn(
                "relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl border transition-colors duration-300",
                lit ? "border-brand bg-brand text-ink" : "border-border bg-surface text-muted",
              )}
            >
              <Icon name={step.icon} className="size-6" />
            </div>
            <div className="md:mt-6">
              <p
                className={cn(
                  "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300",
                  lit ? "bg-brand-soft text-brand-ink" : "bg-bg text-muted ring-1 ring-border",
                )}
              >
                {step.weeks}
              </p>
              <h3 className="mt-3 text-xl">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
