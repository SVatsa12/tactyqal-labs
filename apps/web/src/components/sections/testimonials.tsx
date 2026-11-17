import { site } from "@/content/site";
import { FadeUp } from "@/components/ui/fade-up";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn, initials } from "@/lib/utils";

const avatarTones = ["bg-brand text-ink", "bg-accent text-ink", "bg-ink text-white"] as const;

export function Testimonials() {
  const { testimonials } = site;

  return (
    <section id={testimonials.id} aria-labelledby="testimonials-title" className="section-y">
      <div className="container-page">
        <SectionHeading
          id="testimonials-title"
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          align="center"
        />

        <ul className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {testimonials.items.map((t, i) => (
            <FadeUp as="li" key={t.name} delay={(i % 3) * 0.06} className="mb-5 break-inside-avoid">
              <figure className="card p-7">
                <blockquote className="font-display text-xl font-semibold leading-snug tracking-tight">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-10 place-items-center rounded-full font-display text-sm font-bold",
                      avatarTones[i % avatarTones.length],
                    )}
                  >
                    {initials(t.name)}
                  </span>
                  <span className="font-medium">{t.name}</span>
                </figcaption>
              </figure>
            </FadeUp>
          ))}
        </ul>
      </div>
    </section>
  );
}
