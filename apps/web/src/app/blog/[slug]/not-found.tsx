import Link from "next/link";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";

export default function PostNotFound() {
  const t = site.blogPage;
  return (
    <div className="container-page py-24 text-center md:py-32">
      <h1 className="text-h2">{t.notFoundTitle}</h1>
      <p className="mt-4 text-muted">{t.notFoundBody}</p>
      <Button asChild variant="secondary" className="mt-8">
        <Link href="/blog">{t.backToBlog}</Link>
      </Button>
    </div>
  );
}
