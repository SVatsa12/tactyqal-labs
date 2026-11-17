"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { createTermAction, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/ui/field";

export function TermForm({ kind, label }: { kind: "categories" | "tags"; label: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createTermAction, {});
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const error = state.fieldErrors?.name ?? state.fieldErrors?.slug ?? state.error;
  const id = `new-${kind}`;

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="kind" value={kind} />
      <label htmlFor={id} className="sr-only">
        New {label} name
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name="name"
          required
          maxLength={80}
          placeholder={`New ${label}…`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputCls}
        />
        <Button type="submit" variant="secondary" disabled={pending} aria-label={`Add ${label}`}>
          <Plus aria-hidden="true" />
          Add
        </Button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-brand-ink">
          {error}
        </p>
      ) : null}
    </form>
  );
}
