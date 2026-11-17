import Link from "next/link";
import { ExternalLink, FileText, LogOut, Plus, Tags } from "lucide-react";
import { adminFetch, adminSchemas } from "@/lib/admin/api";
import { logoutAction } from "@/app/admin/actions";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await adminFetch("/auth/me", adminSchemas.me);
  const user = me.ok ? me.data.data : null;

  const nav = [
    { href: "/admin", label: "Posts", icon: FileText },
    { href: "/admin/taxonomy", label: "Categories & tags", icon: Tags },
    { href: "/blog", label: "View blog", icon: ExternalLink },
  ];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-border bg-surface lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-6 p-5">
          <div className="flex items-center justify-between">
            <a href="/admin" className="rounded-lg" aria-label="Admin home">
              <Logo name="Tactyqal" />
            </a>
          </div>

          <Button asChild size="sm" className="justify-start">
            <Link href="/admin/posts/new">
              <Plus aria-hidden="true" /> New post
            </Link>
          </Button>

          <nav aria-label="Admin">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col">
              {nav.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-muted transition-colors hover:bg-bg hover:text-ink"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto hidden border-t border-border pt-4 lg:block">
            {user ? (
              <div className="mb-3 text-sm">
                <p className="font-semibold">{user.name}</p>
                <p className="truncate text-muted">{user.email}</p>
              </div>
            ) : null}
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-bg hover:text-ink"
              >
                <LogOut className="size-4" aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main id="main" className="min-w-0 px-5 py-8 md:px-10 md:py-10">
        {!me.ok ? (
          <p role="alert" className="mb-6 rounded-xl border border-brand/40 bg-brand-soft px-4 py-3 text-sm">
            {me.error.message}
          </p>
        ) : null}
        {children}
        <form action={logoutAction} className="mt-12 lg:hidden">
          <button type="submit" className="text-sm font-medium text-muted underline underline-offset-4">
            Sign out
          </button>
        </form>
      </main>
    </div>
  );
}
