"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Field, inputCls, textareaCls } from "@/components/ui/field";
import { fieldErrors, leadSchema, submitLead, type LeadErrors, type LeadField } from "@/lib/lead";

const FIELD_ORDER: LeadField[] = ["name", "email", "phone", "message"];

export function ContactForm() {
  const t = site.contact.form;
  const formRef = React.useRef<HTMLFormElement>(null);
  const [errors, setErrors] = React.useState<LeadErrors>({});
  const [pending, setPending] = React.useState(false);
  // Until React hydrates, a submit would fall back to a native form post; keep the button disabled.
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  const focusFirstError = (errs: LeadErrors) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      focusFirstError(errs);
      return;
    }

    setErrors({});
    setPending(true);
    const result = await submitLead(parsed.data);
    setPending(false);

    if (result.ok) {
      form.reset();
      toast.success(t.successTitle, { description: t.successBody });
      return;
    }
    if (result.fields && Object.keys(result.fields).length > 0) {
      setErrors(result.fields);
      focusFirstError(result.fields);
      return;
    }
    toast.error(t.errorTitle, { description: result.message ?? t.errorBody });
  }

  // Clear a field's error as soon as the user edits it.
  const clearError = (event: React.FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name as LeadField;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const describedBy = (f: LeadField) => (errors[f] ? `contact-${f}-error` : undefined);

  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-6 text-ink sm:p-7">
      <h3 className="text-xl">{t.title}</h3>
      <p className="mt-1.5 text-[0.9375rem] text-muted">{t.description}</p>

      <form
        ref={formRef}
        method="post"
        noValidate
        onSubmit={onSubmit}
        onInput={clearError}
        className="mt-6 space-y-4"
        aria-busy={pending}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.fields.name.label} htmlFor="contact-name" error={errors.name}>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={80}
              placeholder={t.fields.name.placeholder}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy("name")}
              className={inputCls}
            />
          </Field>
          <Field label={t.fields.email.label} htmlFor="contact-email" error={errors.email}>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder={t.fields.email.placeholder}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy("email")}
              className={inputCls}
            />
          </Field>
        </div>

        <Field
          label={`${t.fields.phone.label} ${t.fields.phone.optional}`}
          htmlFor="contact-phone"
          error={errors.phone}
        >
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder={t.fields.phone.placeholder}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describedBy("phone")}
            className={inputCls}
          />
        </Field>

        <Field label={t.fields.message.label} htmlFor="contact-message" error={errors.message}>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            maxLength={2000}
            placeholder={t.fields.message.placeholder}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy("message")}
            className={textareaCls}
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={pending || !hydrated}>
          {pending ? (
            <>
              <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />
              {t.submitting}
            </>
          ) : (
            <>
              {t.submit}
              <Send aria-hidden="true" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
