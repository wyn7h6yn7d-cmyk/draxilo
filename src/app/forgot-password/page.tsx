import Link from "next/link";

import { forgotPasswordAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const sp = await searchParams;
  const sent = typeof sp.sent === "string" && sp.sent === "1";

  return (
    <AuthShell
      locale={locale}
      dict={dict}
      title={dict.auth.forgot.title}
      subtitle={dict.auth.forgot.subtitle}
    >
      {sent ? (
        <div className="mb-4 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200">
          {dict.auth.forgot.sent}
        </div>
      ) : null}
      <form action={forgotPasswordAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{dict.auth.fields.email}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <Button type="submit" className="w-full">
          {dict.auth.forgot.action}
        </Button>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="text-zinc-900 hover:underline dark:text-zinc-100">
            {dict.auth.forgot.backToLogin}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

