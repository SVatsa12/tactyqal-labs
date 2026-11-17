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
        <Link href="/" className="inline-block rounded-lg">
          <Logo name="Tactyqal Labs" />
        </Link>
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
