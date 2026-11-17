"use client";

import { Toaster as Sonner } from "sonner";

/** Sonner, restyled with the design tokens (light only, soft shadow, card radius). */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      theme="light"
      closeButton
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 font-sans text-ink shadow-lift sm:w-[22rem]",
          title: "font-semibold",
          description: "mt-0.5 text-sm leading-relaxed text-muted",
          icon: "mt-0.5 text-brand-ink",
          success: "[&_[data-icon]]:text-brand-ink",
          error: "[&_[data-icon]]:text-brand-ink",
          closeButton:
            "!left-auto !right-2 !top-2 !translate-x-0 !translate-y-0 !border-border !bg-surface !text-muted hover:!text-ink",
        },
      }}
    />
  );
}
