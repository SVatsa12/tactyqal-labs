"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";

/** Live preview of the cover image URL as it is typed. Plain <img>: any host, no optimisation needed. */
export function CoverPreview({ url }: { url: string }) {
  const [failed, setFailed] = React.useState(false);
  const valid = /^https?:\/\/\S+$/i.test(url);

  React.useEffect(() => setFailed(false), [url]);

  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border bg-brand-soft">
      {valid && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Cover image preview" className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <p className="grid size-full place-items-center px-4 text-center text-xs text-muted">
          <span className="flex flex-col items-center gap-1.5">
            <ImageOff className="size-5" aria-hidden="true" />
            {failed ? "Couldn't load this image" : "Paste an image URL to preview it"}
          </span>
        </p>
      )}
    </div>
  );
}
