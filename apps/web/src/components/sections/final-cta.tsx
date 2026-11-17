import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/fade-up";
import { Icon } from "@/components/ui/icon";
import { ContactForm } from "./contact-form";

/** The one dark band: final call to action, contact details and the contact form. */
export function FinalCta() {
  const { contact, a11y } = site;

  return (
    <section id={contact.id} aria-labelledby="contact-title" className="px-3 pb-3 md:px-6 md:pb-6">
      <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-ink text-white">
        {/* flat decorative shapes */}
        <span aria-hidden="true" className="absolute -left-24 -top-24 size-72 rounded-full bg-brand md:size-80" />
        <span
          aria-hidden="true"
          className="absolute bottom-12 left-[40%] hidden size-12 rounded-2xl bg-accent lg:block"
        />

        <div className="container-page section-y relative grid gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeUp className="lg:pt-4">
            <h2 id="contact-title" className="text-h2 max-w-xl">
              {contact.title}
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-on-ink-muted">{contact.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href={contact.primaryCta.href} target="_blank" rel="noopener noreferrer">
                  {contact.primaryCta.label}
                  <ArrowRight aria-hidden="true" />
                  <span className="sr-only"> {a11y.opensInNewTab}</span>
                </a>
              </Button>
              <Button asChild size="lg" variant="inverse-outline">
                <a href={contact.secondaryCta.href}>{contact.secondaryCta.label}</a>
              </Button>
            </div>

            <div className="mt-12 border-t border-white/15 pt-8">
              <h3 className="text-xl">{contact.detailsTitle}</h3>
              <p className="mt-2 max-w-md text-[0.9375rem] text-on-ink-muted">{contact.detailsDescription}</p>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                {contact.details.map((d) => (
                  <div key={d.label} className="flex items-center gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-accent">
                      <Icon name={d.icon} className="size-[1.125rem]" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-sm text-on-ink-muted">{d.label}</dt>
                      <dd className="truncate font-medium">
                        {d.href ? (
                          <a href={d.href} className="underline-offset-4 hover:underline">
                            {d.value}
                          </a>
                        ) : (
                          d.value
                        )}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <ContactForm />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
