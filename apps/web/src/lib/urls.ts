/**
 * Every absolute URL the web app needs, read from env in one place. The localhost values are
 * development defaults only; a production build without the variable logs a warning.
 */
function fromEnv(value: string | undefined, name: string, devDefault: string): string {
  // Warn on the server only: API_URL is never available in the browser, and that is fine.
  if (!value && process.env.NODE_ENV === "production" && typeof window === "undefined") {
    console.warn(`[config] ${name} is not set; falling back to ${devDefault}`);
  }
  return (value || devDefault).replace(/\/$/, "");
}

/** Public origin of this site (canonical URLs, sitemap, Open Graph). */
export const SITE_URL = fromEnv(process.env.NEXT_PUBLIC_SITE_URL, "NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

/** Blog API as seen from the Next.js server (may be a private/internal URL). Server-only. */
export const API_URL = fromEnv(process.env.API_URL, "API_URL", "http://localhost:4000");

/** Blog API as seen from the browser (contact form). Inlined at build time. */
export const PUBLIC_API_URL = fromEnv(process.env.NEXT_PUBLIC_API_URL, "NEXT_PUBLIC_API_URL", "http://localhost:4000");
