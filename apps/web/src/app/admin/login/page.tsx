import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/admin") ? sp.next : undefined;

  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2"
          >
            <Logo name="Tactyqal Labs" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 rounded"
          >
            <span aria-hidden="true">←</span>
            <span>Back to site</span>
          </Link>
        </div>
        <div className="card mt-8 p-7">
          <h1 className="text-2xl">Sign in to the blog admin</h1>
          <p className="mt-1.5 text-sm text-muted">Write, edit and publish posts.</p>
          <div className="mt-6">
            <LoginForm next={next} expired={sp.expired === "1"} />
          </div>
        </div>
      </div>
    </main>
  );
}
