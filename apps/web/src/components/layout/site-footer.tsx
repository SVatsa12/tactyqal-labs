import { ArrowUp } from "lucide-react";
import { site } from "@/content/site";
import { isExternal } from "@/lib/utils";
import { Logo } from "./logo";

export function SiteFooter() {
  const { footer, brand, a11y } = site;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo name={brand.name} />
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{footer.tagline}</p>
        </div>

        {footer.columns.map((col) => (
          <nav key={col.title} aria-label={`${a11y.footerNav}: ${col.title}`}>
            <h2 className="font-sans text-sm font-semibold tracking-normal text-ink">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => {
                const external = isExternal(link.href);
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="break-words text-[0.9375rem] text-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                      {external ? <span className="sr-only"> {a11y.opensInNewTab}</span> : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-start justify-between gap-4 py-6 text-sm text-muted sm:flex-row sm:items-center">
          <p>
            © {year} {footer.copyright}
          </p>
          <a
            href={footer.backToTop.href}
            className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-ink"
          >
            {footer.backToTop.label}
            <ArrowUp className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
