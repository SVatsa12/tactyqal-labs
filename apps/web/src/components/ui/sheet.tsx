"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Slide-out panel from the right (Radix Dialog: focus trap, Escape, scroll lock,
 * focus return). Restyled with the design tokens; animation is off under reduced motion.
 */
export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  title,
  closeLabel,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Content> & { title: string; closeLabel: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/40 data-[state=closed]:animate-[overlay-out_200ms_ease-in] data-[state=open]:animate-[overlay-in_200ms_ease-out]" />
      <Dialog.Content
        aria-describedby={undefined}
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-[min(22rem,calc(100%-2.5rem))] flex-col border-l border-border bg-surface shadow-lift",
          "data-[state=closed]:animate-[sheet-out_220ms_ease-in] data-[state=open]:animate-[sheet-in_280ms_cubic-bezier(0.22,1,0.36,1)]",
          className,
        )}
        {...props}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Dialog.Title className="font-display text-lg font-semibold tracking-tight">{title}</Dialog.Title>
          <Dialog.Close
            aria-label={closeLabel}
            className="grid size-11 place-items-center rounded-full text-ink hover:bg-ink/5"
          >
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
