import type * as React from "react";

type FadeUpProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use small steps (0.05–0.1) to stagger siblings. */
  delay?: number;
  as?: "div" | "li" | "article" | "section";
  /** Above the fold: animate with CSS on first paint instead of waiting for the observer. */
  immediate?: boolean;
};

/**
 * The one entrance animation: fade + rise 16px, once, 0.5s.
 * Server-rendered and visible by default. Only when JavaScript runs (html.js, set by an inline
 * script in the layout) does CSS hide it until FadeUpObserver marks it as in view, so content is
 * never invisible without JS. prefers-reduced-motion skips the effect entirely (globals.css).
 */
export function FadeUp({ children, className, delay = 0, as: Tag = "div", immediate = false }: FadeUpProps) {
  return (
    <Tag
      {...(immediate ? { "data-fade-now": "" } : { "data-fade": "" })}
      className={className}
      style={delay ? ({ "--fade-delay": `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
