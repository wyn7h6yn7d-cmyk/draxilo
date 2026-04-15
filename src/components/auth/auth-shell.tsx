"use client";

import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { DraxionLogo } from "@/components/brand/draxion-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/types";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function AuthShell({
  locale,
  dict,
  title,
  subtitle,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600">
            <DraxionLogo />
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {dict.nav.login}
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

