import { cn } from "@/lib/utils";
import { FadeUp } from "./fade-up";

type SectionHeadingProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <FadeUp
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-brand-ink">
        {eyebrow}
      </p>
      <h2 id={id} className="text-h2">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-lg leading-relaxed text-muted">{description}</p>
      ) : null}
    </FadeUp>
  );
}
