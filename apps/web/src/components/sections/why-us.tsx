import { site } from "@/content/site";
import { FadeUp } from "@/components/ui/fade-up";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { VideoEmbed } from "./video-embed";

export function WhyUs() {
  const { why, video } = site;

  return (
    <section id={why.id} aria-labelledby="why-title" className="section-y">
      <div className="container-page">
        <SectionHeading
          id="why-title"
          eyebrow={why.eyebrow}
          title={why.title}
          description={why.description}
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {why.features.map((f, i) => (
            <FadeUp as="li" key={f.title} delay={(i % 4) * 0.05}>
              <div className="card card-hover h-full p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                  <Icon name={f.icon} className="size-5" />
                </span>
                <h3 className="mt-5 text-lg">{f.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{f.description}</p>
              </div>
            </FadeUp>
          ))}
        </ul>

        {/* Founder talk */}
        <FadeUp className="mt-6">
          <div className="grid items-center gap-8 rounded-[var(--radius-panel)] border border-border bg-surface p-6 shadow-soft md:p-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
            <div className="lg:pl-2">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-ink">
                {video.eyebrow}
              </p>
              <h3 className="mt-3 text-3xl">{video.title}</h3>
              <p className="mt-4 leading-relaxed text-muted">{video.description}</p>
            </div>
            <VideoEmbed />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
