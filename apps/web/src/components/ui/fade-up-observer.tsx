"use client";

import * as React from "react";

/**
 * Reveals [data-fade] elements once they scroll into view (adds data-in). Mounted once in the
 * root layout; also picks up elements added later (client navigation, streamed Suspense content).
 */
export function FadeUpObserver() {
  React.useEffect(() => {
    // Tells the layout's fallback timer that the observer is running.
    (window as Window & { __fadeReady?: boolean }).__fadeReady = true;
    const reveal = (el: Element) => el.setAttribute("data-in", "");
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-fade]").forEach(reveal);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    const watch = (root: ParentNode) => {
      if (root instanceof Element && root.matches("[data-fade]:not([data-in])")) io.observe(root);
      root.querySelectorAll("[data-fade]:not([data-in])").forEach((el) => io.observe(el));
    };

    watch(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && watch(n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
