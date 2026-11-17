"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ArrowRight, Menu } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

/** "/#stories" -> "stories"; "/blog" -> "blog" (the homepage blog section shares the id). */
const sectionIdOf = (href: string) => (href.includes("#") ? (href.split("#")[1] ?? "") : href.replace(/^\//, ""));

/** Which homepage section is under the header band right now (null on other pages / the hero). */
function useActiveSection(ids: string[], enabled: boolean) {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // Sections don't overlap, so at most one is in the band; keep page order if they ever do.
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      // A thin band just below the sticky header.
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, enabled]);

  return active;
}

export function SiteHeader() {
  const { nav, brand, a11y } = site;
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const pendingHash = React.useRef<string | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ids = React.useMemo(() => nav.links.map((l) => sectionIdOf(l.href)), [nav.links]);
  const activeSection = useActiveSection(ids, isHome);

  const isActive = (href: string) =>
    href === "/blog"
      ? pathname.startsWith("/blog") || activeSection === "blog"
      : isHome && activeSection === sectionIdOf(href);

  // In the sheet, same-page section links scroll after the sheet has closed and released its scroll lock.
  const onSheetLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isHome && href.startsWith("/#")) {
      event.preventDefault(); // also skips SheetClose's handler, so close explicitly
      pendingHash.current = sectionIdOf(href);
      setOpen(false);
    }
  };
  const onSheetClosed = (event: Event) => {
    const id = pendingHash.current;
    pendingHash.current = null;
    if (!id) return;
    event.preventDefault(); // focus the section instead of the menu button
    const target = document.getElementById(id);
    if (!target) return;
    window.history.pushState(null, "", `#${id}`);
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-200",
        scrolled ? "border-border bg-bg/85 backdrop-blur-sm" : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-18">
        <Link href="/" aria-label={brand.homeLabel} className="rounded-lg">
          <Logo name={brand.name} />
        </Link>

        <nav aria-label={a11y.primaryNav} className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {nav.links.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={active ? (link.href === "/blog" && !isHome ? "page" : "true") : undefined}
                    className={cn(
                      "relative rounded-full px-3 py-2 text-[0.9375rem] font-medium transition-colors",
                      active ? "bg-brand-soft text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={nav.cta.href}>{nav.cta.label}</a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label={a11y.openMenu}
              className="grid size-11 place-items-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent title={a11y.menuTitle} closeLabel={a11y.closeMenu} onCloseAutoFocus={onSheetClosed}>
              <nav aria-label={a11y.primaryNav} className="px-6 py-4">
                <ul className="flex flex-col">
                  {nav.links.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <li key={link.href} className="border-b border-border last:border-b-0">
                        <SheetClose asChild>
                          <a
                            href={link.href}
                            onClick={(e) => onSheetLinkClick(e, link.href)}
                            aria-current={active ? "true" : undefined}
                            className={cn(
                              "flex items-center justify-between py-3.5 font-display text-xl font-semibold tracking-tight",
                              active ? "text-brand-ink" : "text-ink",
                            )}
                          >
                            {link.label}
                            {active ? <span className="size-2 rounded-full bg-brand" aria-hidden="true" /> : null}
                          </a>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
                <SheetClose asChild>
                  <Button asChild size="lg" className="mt-6 w-full">
                    <a href={nav.cta.href} onClick={(e) => onSheetLinkClick(e, nav.cta.href)}>
                      {nav.cta.label}
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
