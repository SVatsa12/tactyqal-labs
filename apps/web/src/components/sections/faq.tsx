import { ArrowRight, MessageCircle } from "lucide-react";
import { site } from "@/content/site";
import { AccordionItem } from "@/components/ui/accordion";
import { FadeUp } from "@/components/ui/fade-up";
import { SectionHeading } from "@/components/ui/section-heading";

export function Faq() {
  const { faq } = site;

  return (
    <section id={faq.id} aria-labelledby="faq-title" className="section-y">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="faq-title" eyebrow={faq.eyebrow} title={faq.title} description={faq.description} />
          <FadeUp delay={0.05}>
            <div className="card mt-10 p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl">{faq.stillQuestions.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{faq.stillQuestions.body}</p>
              <a
                href={faq.stillQuestions.cta.href}
                className="mt-4 inline-flex items-center gap-1.5 font-semibold text-brand-ink underline-offset-4 hover:underline"
              >
                {faq.stillQuestions.cta.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </FadeUp>
        </div>

        <FadeUp>
          <div className="space-y-3">
            {faq.items.map((item, i) => (
              <AccordionItem key={item.question} name="faq" question={item.question} open={i === 0}>
                {item.answer}
              </AccordionItem>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
