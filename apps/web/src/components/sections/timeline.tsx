import { site } from "@/content/site";
import { SectionHeading } from "@/components/ui/section-heading";
import { TimelineTrack } from "./timeline-track";

export function Timeline() {
  const { timeline } = site;

  return (
    <section id={timeline.id} aria-labelledby="timeline-title" className="section-y border-y border-border bg-surface">
      <div className="container-page">
        <SectionHeading
          id="timeline-title"
          eyebrow={timeline.eyebrow}
          title={timeline.title}
          description={timeline.description}
        />
        <TimelineTrack steps={timeline.steps} />
      </div>
    </section>
  );
}
