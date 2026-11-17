"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  /** Shown in the confirm dialog, e.g. the post title. */
  itemLabel: string;
  variant?: "icon" | "text";
  /** Toast shown after the action returns. Omit when the action redirects (use FlashToast there). */
  successMessage?: string;
};

function Submit({ itemLabel, variant }: { itemLabel: string; variant: "icon" | "text" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={variant === "icon" ? `Delete “${itemLabel}”` : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted transition-colors hover:text-brand-ink disabled:opacity-50",
        variant === "icon" ? "size-9 justify-center hover:bg-brand-soft" : "px-3 py-2 hover:bg-brand-soft",
      )}
    >
      <Trash2 className="size-4" aria-hidden="true" />
      {variant === "text" ? (pending ? "Deleting…" : "Delete") : null}
    </button>
  );
}

/** A small form that asks for confirmation before running a delete server action. */
export function DeleteButton({ action, fields, itemLabel, variant = "icon", successMessage }: Props) {
  const run = async (formData: FormData) => {
    try {
      await action(formData);
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      // redirect() from the action surfaces here as a special error; let Next handle it.
      if (error instanceof Error && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
      toast.error(`Couldn't delete “${itemLabel}”`);
    }
  };

  return (
    <form
      action={run}
      onSubmit={(e) => {
        if (!window.confirm(`Delete “${itemLabel}”? This can't be undone.`)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <Submit itemLabel={itemLabel} variant={variant} />
    </form>
  );
}
