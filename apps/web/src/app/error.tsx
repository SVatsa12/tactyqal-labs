"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";

/** Error boundary for every route below the root layout. Never shows error details to visitors. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = site.errorPage;

  React.useEffect(() => {
    console.error(error); // visible in the browser console / Vercel logs, not on the page
  }, [error]);

  return (
    <main id="main" className="container-page grid min-h-[70vh] place-items-center py-24 text-center">
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-ink">{t.eyebrow}</p>
        <h1 className="text-h2 mt-4">{t.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{t.body}</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            {t.retry}
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={t.home.href}>{t.home.label}</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
