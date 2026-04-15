import Link from "next/link";

import { signUpAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function SignupPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <AuthShell
      locale={locale}
      dict={dict}
      title={dict.auth.signup.title}
      subtitle={dict.auth.signup.subtitle}
    >
      <form action={signUpAction} className="space-y-4">
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
          <Label htmlFor="password">{dict.auth.fields.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <Button type="submit" className="w-full">
          {dict.auth.signup.action}
        </Button>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {dict.auth.signup.haveAccount}{" "}
          <Link href="/login" className="text-zinc-900 hover:underline dark:text-zinc-100">
            {dict.nav.login}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

