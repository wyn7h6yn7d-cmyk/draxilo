import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { signOutAction } from "@/app/actions/auth";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { DraxionLogo, DraxionMark } from "@/components/brand/draxion-logo";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale, LOCALE_COOKIE } from "@/lib/i18n/locale";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";

export default async function MainAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) redirect("/login");

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) redirect("/app/onboarding");

  if (!workspace.settings?.onboardingCompletedAt) {
    redirect("/app/onboarding");
  }

  const locale = await getLocale();

  const dict = await getDictionary(locale);

  // Keep cookie stable (in case user arrives directly).
  // (Cookie is already the source of truth here.)

  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-1">
      <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 md:block">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/app" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600">
            <DraxionLogo />
          </Link>
          <LocaleSwitcher locale={locale} />
        </div>
        <nav className="space-y-1">
          <Link
            href="/app/leads"
            className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {dict.nav.leads}
          </Link>
          <Link
            href="/app/campaigns"
            className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {dict.nav.campaigns}
          </Link>
          <Link
            href="/app/jobs"
            className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {dict.nav.jobs}
          </Link>
          <Link
            href="/app/settings"
            className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {dict.nav.settings}
          </Link>
        </nav>
        <form action={signOutAction} className="mt-6">
          <Button type="submit" variant="secondary" className="w-full">
            {dict.nav.signout}
          </Button>
        </form>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 md:hidden">
          <Link href="/app" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600">
            <div className="flex items-center gap-2">
              <DraxionMark className="h-8 w-8" />
              <span className="text-sm font-semibold tracking-tight">{dict.app.name}</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} />
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                {dict.nav.signout}
              </Button>
            </form>
          </div>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}

