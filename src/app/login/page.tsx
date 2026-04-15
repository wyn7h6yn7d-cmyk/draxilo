import Link from "next/link";

import { signInAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/app";

  return (
    <AuthShell
      locale={locale}
      dict={dict}
      title={dict.auth.login.title}
      subtitle={dict.auth.login.subtitle}
    >
      <form action={signInAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <div className="space-y-2">
          <Label htmlFor="email">{dict.auth.fields.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{dict.auth.fields.password}</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-zinc-600 hover:underline dark:text-zinc-400"
            >
              {dict.auth.login.forgot}
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          {dict.auth.login.action}
        </Button>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {dict.auth.login.noAccount}{" "}
          <Link href="/signup" className="text-zinc-900 hover:underline dark:text-zinc-100">
            {dict.nav.signup}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

