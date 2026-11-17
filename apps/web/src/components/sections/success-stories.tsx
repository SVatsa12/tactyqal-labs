import { TrendingUp } from "lucide-react";
import { site } from "@/content/site";
import { FadeUp } from "@/components/ui/fade-up";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { StoryPreview } from "./story-preview";

/** Bento grid: 4 columns on desktop; stories with a revenue fact get a wide card. */
export function SuccessStories() {
  const { success } = site;

  return (
    <section id={success.id} aria-labelledby="stories-title" className="section-y">
      <div className="container-page">
        <SectionHeading
          id="stories-title"
          eyebrow={success.eyebrow}
          title={success.title}
          description={success.description}
        />

        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {success.stories.map((story, i) => (
            <FadeUp as="li" key={story.name} delay={(i % 3) * 0.06} className={cn(story.wide && "md:col-span-2")}>
              <article
                className={cn(
                  "card card-hover flex h-full flex-col overflow-hidden",
                  story.wide && "md:grid md:grid-cols-[2fr_3fr]",
                )}
              >
                <StoryPreview
                  kind={story.preview}
                  className={cn(
                    "h-44 border-b border-border",
                    story.wide && "md:h-full md:min-h-60 md:border-b-0 md:border-r",
                  )}
                />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl">{story.name}</h3>
                  {story.metric ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-ink">
                      <TrendingUp className="size-4" aria-hidden="true" />
                      {story.metric}
                    </p>
                  ) : null}
                  <p className="mt-3 flex-1 leading-relaxed text-muted">{story.description}</p>
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
