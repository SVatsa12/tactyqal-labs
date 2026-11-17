"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { site } from "@/content/site";

/** Click-to-load YouTube embed: no third-party requests until the user asks. */
export function VideoEmbed() {
  const { video } = site;
  const [playing, setPlaying] = React.useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] bg-ink">
      {playing ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?start=${video.startSeconds}&autoplay=1&rel=0`}
          title={video.videoTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={video.playLabel}
          className="group absolute inset-0 flex flex-col justify-between p-6 text-left text-white focus-visible:outline-offset-[-4px] md:p-8"
        >
          {/* flat decorative shapes */}
          <span aria-hidden="true" className="absolute -right-10 -top-10 size-48 rounded-full bg-brand" />
          <span aria-hidden="true" className="absolute right-24 top-20 size-10 rounded-xl bg-accent" />

          <span className="relative grid size-16 place-items-center rounded-full bg-surface text-ink shadow-lift transition-transform duration-200 group-hover:scale-105 md:size-20">
            <Play className="ml-1 size-7 fill-ink" aria-hidden="true" />
          </span>
          <span className="relative">
            <span className="block font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {video.posterTitle}
            </span>
            <span className="mt-1 block text-sm text-on-ink-muted">{video.posterMeta}</span>
          </span>
        </button>
      )}
    </div>
  );
}
