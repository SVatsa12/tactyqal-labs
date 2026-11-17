import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { site } from "@/content/site";
import { Toaster } from "@/components/ui/toaster";
import { FadeUpObserver } from "@/components/ui/fade-up-observer";
import "./globals.css";
import { SITE_URL } from "@/lib/urls";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
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
