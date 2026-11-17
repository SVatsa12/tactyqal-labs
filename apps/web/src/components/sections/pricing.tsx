import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/fade-up";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";

export function Pricing() {
  const { pricing, a11y } = site;

  return (
    <section id={pricing.id} aria-labelledby="pricing-title" className="section-y border-y border-border bg-surface">
      <div className="container-page grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading
            id="pricing-title"
            eyebrow={pricing.eyebrow}
            title={pricing.title}
            description={pricing.description}
          />
          <FadeUp delay={0.05}>
            <ul className="mt-10 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
              {pricing.reassurance.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{item.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{item.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>

        <FadeUp>
          <div className="relative rounded-[var(--radius-panel)] border border-border bg-bg p-6 shadow-soft sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl">{pricing.planName}</h3>
              <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-ink">
                {pricing.offerBadge}
              </span>
            </div>

            <p className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="sr-only">{pricing.priceLabel}:</span>
              <span className="font-display text-5xl font-bold leading-none tracking-tight sm:text-6xl">
                {pricing.price}
              </span>
              <span className="pb-1.5 text-lg text-muted">
                <span className="sr-only">{pricing.originalPriceLabel}:</span>
                <s>{pricing.originalPrice}</s>
              </span>
            </p>

            <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {pricing.includes.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink">
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="mt-9 w-full">
              <a href={pricing.cta.href} target="_blank" rel="noopener noreferrer">
                {pricing.cta.label}
                <ArrowRight aria-hidden="true" />
                <span className="sr-only"> {a11y.opensInNewTab}</span>
              </a>
            </Button>

            <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2 font-medium">
                <ShieldCheck className="size-4 text-brand-ink" aria-hidden="true" />
                {pricing.guarantee}
              </span>
              <span className="text-muted">{pricing.scarcity}</span>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
