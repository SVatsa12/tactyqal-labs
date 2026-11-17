"use client";

import * as React from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { TimelineStep } from "@/content/site";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * 4-step track: horizontal from md, vertical on mobile. The brand line fills as the
 * section scrolls through the viewport; with reduced motion it is shown full and static.
 */
export function TimelineTrack({ steps }: { steps: TimelineStep[] }) {
  const ref = React.useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [reached, setReached] = React.useState(0);

  useMotionValueEvent(fill, "change", (v) => {
    // Step i lights up once the line reaches it (steps sit at 0, 1/3, 2/3, 1).
    setReached(Math.min(steps.length, Math.floor(v * (steps.length - 1) + 0.001) + 1));
  });

  const lit = (i: number) => reduce || i < reached;
  const scale = reduce ? 1 : fill;

  return (
    <ol ref={ref} className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
      {/* Desktop: horizontal track from the first to the last icon */}
      <span
        aria-hidden="true"
        className="absolute left-7 top-7 hidden h-0.5 -translate-y-1/2 bg-border md:block"
        style={{ right: "calc((100% - 4.5rem) / 4 - 1.75rem)" }}
      >
        <motion.span className="block h-full w-full origin-left bg-brand" style={{ scaleX: scale }} />
      </span>

      {steps.map((step, i) => (
        <li key={step.weeks} className="relative flex gap-5 md:block">
          {i < steps.length - 1 ? (
            <MobileConnector fill={fill} index={i} count={steps.length} reduce={!!reduce} />
          ) : null}
          <div
            className={cn(
              "relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl border transition-colors duration-300",
              lit(i) ? "border-brand bg-brand text-ink" : "border-border bg-surface text-muted",
            )}
          >
            <Icon name={step.icon} className="size-6" />
          </div>
          <div className="md:mt-6">
            <p
              className={cn(
                "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300",
                lit(i) ? "bg-brand-soft text-brand-ink" : "bg-bg text-muted ring-1 ring-border",
              )}
            >
              {step.weeks}
            </p>
            <h3 className="mt-3 text-xl">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Mobile only: line from this step's icon to the next one, filling in turn. */
function MobileConnector({
  fill,
  index,
  count,
  reduce,
}: {
  fill: MotionValue<number>;
  index: number;
  count: number;
  reduce: boolean;
}) {
  const segment = useTransform(fill, (v) => Math.min(1, Math.max(0, v * (count - 1) - index)));
  return (
    <span
      aria-hidden="true"
      className="absolute left-7 top-7 h-[calc(100%+2.5rem)] w-0.5 -translate-x-1/2 bg-border md:hidden"
    >
      <motion.span className="block h-full w-full origin-top bg-brand" style={{ scaleY: reduce ? 1 : segment }} />
    </span>
  );
}
