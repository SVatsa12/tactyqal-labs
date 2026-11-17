"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "./field";

export function LoginForm({ next, expired }: { next?: string; expired: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});

  return (
    <form action={action} className="space-y-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {expired && !state.error ? (
        <p role="status" className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-ink">
          Your session expired. Please sign in again.
        </p>
      ) : null}
      {state.error ? (
        <p role="alert" className="rounded-xl border border-brand/40 bg-brand-soft px-4 py-3 text-sm font-medium text-ink">
          {state.error}
        </p>
      ) : null}

      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required className={inputCls} />
      </Field>
      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputCls}
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
