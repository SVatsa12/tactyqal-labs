import { ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/fade-up";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";

export function Tools() {
  const { tools, a11y } = site;

  return (
    <section id={tools.id} aria-labelledby="tools-title" className="section-y border-y border-border bg-surface">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            id="tools-title"
            eyebrow={tools.eyebrow}
            title={tools.title}
            description={tools.description}
          />
          <FadeUp>
            <Button asChild variant="secondary">
              <a href={tools.cta.href} target="_blank" rel="noopener noreferrer">
                {tools.cta.label}
                <ArrowUpRight aria-hidden="true" />
                <span className="sr-only"> {a11y.opensInNewTab}</span>
              </a>
            </Button>
          </FadeUp>
        </div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tools.items.map((tool, i) => (
            <FadeUp as="li" key={tool.name} delay={(i % 4) * 0.05}>
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group card card-hover flex h-full items-center gap-4 p-4 pr-5"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-bg text-ink transition-colors group-hover:bg-brand-soft group-hover:text-brand-ink">
                  <Icon name={tool.icon} className="size-5" />
                </span>
                <span className="flex-1 font-medium leading-snug">{tool.name}</span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted transition-colors group-hover:text-brand-ink"
                  aria-hidden="true"
                />
                <span className="sr-only"> {a11y.opensInNewTab}</span>
              </a>
            </FadeUp>
          ))}
        </ul>
      </div>
    </section>
  );
}
