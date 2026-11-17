import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/sections/hero";
import { SuccessStories } from "@/components/sections/success-stories";
import { Program } from "@/components/sections/program";
import { WhyUs } from "@/components/sections/why-us";
import { Tools } from "@/components/sections/tools";
import { Testimonials } from "@/components/sections/testimonials";
import { BlogPreview } from "@/components/sections/blog-preview";
import { Pricing } from "@/components/sections/pricing";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";

// Re-render at most once a minute so new blog posts appear on the homepage.
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <SuccessStories />
        <Program />
        <WhyUs />
        <Tools />
        <Testimonials />
        <BlogPreview />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
