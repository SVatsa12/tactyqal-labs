"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

type FadeUpProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use small steps (0.05–0.1) to stagger siblings. */
  delay?: number;
  as?: "div" | "li" | "article" | "section";
};

/** The one entrance animation: fade + rise 16px, once, 0.5s. */
export function FadeUp({ children, className, delay = 0, as = "div" }: FadeUpProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Comp>
  );
}
