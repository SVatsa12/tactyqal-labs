"use client";

import Link from "next/link";
import * as React from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { cn, isExternal } from "@/lib/utils";
import { Logo } from "./logo";

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { nav, brand, a11y } = site;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape and lock page scroll while it is open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-bg transition-colors duration-200",
        scrolled || open ? "border-border" : "border-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-18">
        <Link href="/" aria-label={brand.homeLabel} className="rounded-lg">
          <Logo name={brand.name} />
        </Link>

        <nav aria-label={a11y.primaryNav} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3 py-2 text-[0.9375rem] font-medium text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={nav.cta.href} target="_blank" rel="noopener noreferrer">
              {nav.cta.label}
              <span className="sr-only"> {a11y.opensInNewTab}</span>
            </a>
          </Button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
            aria-label={open ? a11y.closeMenu : a11y.openMenu}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto border-t border-border bg-bg lg:hidden"
      >
        <nav aria-label={a11y.primaryNav} className="container-page py-6">
          <ul className="flex flex-col">
            {nav.links.map((link) => (
              <li key={link.href} className="border-b border-border">
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 font-display text-2xl font-semibold tracking-tight"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-8 w-full">
            <a
              href={nav.cta.href}
              target={isExternal(nav.cta.href) ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              {nav.cta.label}
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
