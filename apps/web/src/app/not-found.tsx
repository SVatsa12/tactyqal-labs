import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { site } from "@/content/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: site.notFound.title, robots: { index: false } };

export default function NotFound() {
  const t = site.notFound;
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page grid min-h-[60vh] place-items-center py-24 text-center md:py-32">
        <div className="max-w-xl">
          <p className="font-display text-7xl font-bold tracking-tight text-brand md:text-8xl">{t.eyebrow}</p>
          <h1 className="text-h2 mt-6">{t.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{t.body}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={t.home.href}>
                <ArrowLeft aria-hidden="true" />
                {t.home.label}
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={t.blog.href}>{t.blog.label}</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
