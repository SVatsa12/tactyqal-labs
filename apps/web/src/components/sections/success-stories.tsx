import { site } from "@/content/site";
import { FadeUp } from "@/components/ui/fade-up";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { SectionHeading } from "@/components/ui/section-heading";

export function SuccessStories() {
  const { success } = site;

  return (
    <section id={success.id} aria-labelledby="success-title" className="section-y">
      <div className="container-page">
        <SectionHeading
          id="success-title"
          eyebrow={success.eyebrow}
          title={success.title}
          description={success.description}
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {success.stories.map((story, i) => (
            <FadeUp as="li" key={story.name} delay={(i % 3) * 0.06}>
              <article className="card card-hover flex h-full flex-col overflow-hidden">
                <div className="flex h-60 items-end justify-center overflow-hidden border-b border-border bg-brand-soft px-8 pt-8">
                  <PhoneMockup
                    kind={story.mockup}
                    appName={story.name}
                    className="w-36 translate-y-10"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl">{story.name}</h3>
                  <p className="mt-2.5 flex-1 leading-relaxed text-muted">{story.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {story.highlights.map((h) => (
                      <li
                        key={h}
                        className="rounded-full border border-border bg-bg px-3 py-1 text-sm font-medium text-ink"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </FadeUp>
          ))}
        </ul>
      </div>
    </section>
  );
}
