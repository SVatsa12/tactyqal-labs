import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/content/site";
import { Toaster } from "@/components/ui/toaster";
import { FadeUpObserver } from "@/components/ui/fade-up-observer";
import "./globals.css";
import { SITE_URL } from "@/lib/urls";

// Self-hosted with next/font/local from npm packages (pinned in the lockfile), so builds never
// fetch from Google Fonts: a bad Google Fonts response once failed the Vercel build.
// Both are variable fonts (OFL-1.1); next/font still preloads them and generates size-adjusted fallbacks.
const bricolage = localFont({
  src: "../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-bricolage",
  display: "swap",
});

const geist = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: site.meta.title,
    template: `%s · ${site.brand.name}`,
  },
  description: site.meta.description,
  openGraph: {
    type: "website",
    siteName: site.brand.name,
    title: site.meta.title,
    description: site.meta.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF7",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${geist.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables FadeUp's hidden start state only when JS runs; if the observer has not
            started within 3s (slow or failed JS), the hidden state is dropped so nothing stays invisible. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__fadeReady)document.documentElement.classList.remove('js')},3000)",
          }}
        />
      </head>
      <body>
        <span id="top" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          {site.a11y.skipToContent}
        </a>
        {children}
        <Toaster />
        <FadeUpObserver />
      </body>
    </html>
  );
}
