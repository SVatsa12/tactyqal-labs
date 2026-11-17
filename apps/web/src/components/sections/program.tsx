import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/fade-up";
import { SectionHeading } from "@/components/ui/section-heading";

export function Program() {
  const { program, a11y } = site;

  return (
    <section id={program.id} aria-labelledby="program-title" className="section-y">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            id="program-title"
            eyebrow={program.eyebrow}
            title={program.title}
            description={program.description}
          />
          <FadeUp>
            <ul className="flex flex-wrap gap-2">
              {program.sessionFacts.map((fact) => (
                <li key={fact} className="rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-medium text-brand-ink">
                  {fact}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>

        {/* Quote + outcomes */}
        <div className="mt-14 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <FadeUp>
            <figure className="h-full rounded-[var(--radius-panel)] bg-brand-soft p-8 md:p-10">
              <svg viewBox="0 0 32 24" className="h-6 w-8 fill-brand" aria-hidden="true">
                <path d="M0 24V14C0 6 4 1 12 0l1 4c-4 1-6 4-6 8h5v12H0Zm19 0V14c0-8 4-13 12-14l1 4c-4 1-6 4-6 8h5v12H19Z" />
              </svg>
              <blockquote className="mt-5 font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
                {program.quote.text}
              </blockquote>
              <figcaption className="mt-5 text-muted">— {program.quote.author}</figcaption>
            </figure>
          </FadeUp>

          <FadeUp delay={0.08}>
            <div className="card flex h-full flex-col p-8 md:p-10">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted font-sans">
                {program.outcomesLabel}
              </h3>
              <ul className="mt-5 flex-1 space-y-3.5">
                {program.outcomes.map((o) => (
                  <li key={o} className="flex items-center gap-3 text-lg font-medium">
                    <span className="size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    {o}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 self-start">
                <a href={program.cta.href} target="_blank" rel="noopener noreferrer">
                  {program.cta.label}
                  <ArrowRight aria-hidden="true" />
                  <span className="sr-only"> {a11y.opensInNewTab}</span>
                </a>
              </Button>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
