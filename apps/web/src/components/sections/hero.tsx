import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/fade-up";
import { HeroVisual } from "./hero-visual";

export function Hero() {
  const { hero, a11y } = site;

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="container-page grid items-center gap-16 pb-20 pt-12 md:pb-28 md:pt-20 lg:grid-cols-[1fr_1fr] lg:gap-10">
        {/* Copy */}
        <div>
          <FadeUp>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-ink shadow-soft">
              <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
              {hero.eyebrow}
            </p>
          </FadeUp>

          <FadeUp delay={0.05}>
            <h1 id="hero-title" className="text-h1 mt-6">
              {hero.titleBefore} <span className="marker">{hero.titleHighlight}</span>
              {hero.titleAfter}
            </h1>
          </FadeUp>

          <FadeUp delay={0.1}>
            <ul className="mt-7 flex max-w-xl flex-wrap gap-x-5 gap-y-2.5 text-[0.9375rem] text-muted md:text-base">
              {hero.pillars.map((pillar) => (
                <li key={pillar} className="inline-flex items-center gap-2">
                  <Check className="size-4 text-brand-ink" aria-hidden="true" />
                  {pillar}
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp delay={0.15} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <a href={hero.primaryCta.href} target="_blank" rel="noopener noreferrer">
                {hero.primaryCta.label}
                <ArrowRight aria-hidden="true" />
                <span className="sr-only"> {a11y.opensInNewTab}</span>
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
            </Button>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="mt-8 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-dashed border-brand/50 bg-brand-soft px-4 py-3 text-sm">
              <span className="font-semibold text-brand-ink">{hero.offer.label}</span>
              <span className="flex items-baseline gap-2">
                <s className="text-muted">{hero.offer.originalPrice}</s>
                <span className="font-display text-lg font-bold tracking-tight">{hero.offer.price}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-ink">
                <ShieldCheck className="size-4 text-brand-ink" aria-hidden="true" />
                {hero.offer.guarantee}
              </span>
            </div>
          </FadeUp>
        </div>

        {/* Visual */}
        <FadeUp delay={0.1} className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
          <HeroVisual />
        </FadeUp>
      </div>

      {/* Stats */}
      <div className="container-page pb-6">
        <FadeUp>
          <dl className="grid divide-y divide-border rounded-[var(--radius-panel)] border border-border bg-surface shadow-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {hero.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1 px-7 py-6 md:px-9 md:py-8">
                <dt className="text-muted">{stat.label}</dt>
                <dd className="font-display text-4xl font-bold tracking-tight lg:text-5xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </FadeUp>
      </div>
    </section>
  );
}
