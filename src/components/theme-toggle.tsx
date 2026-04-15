"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/types";
import { tKey } from "@/lib/i18n/t";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [locale, setLocale] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)lf_locale=([^;]+)/);
    const raw = match?.[1]?.toLowerCase();
    if (raw === "et" || raw === "en" || raw === "ru") setLocale(raw);
  }, []);

  const current = theme === "system" ? systemTheme : theme;
  const Icon = !mounted ? Laptop : current === "dark" ? Moon : Sun;

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const label =
    theme === "light"
      ? tKey(locale, "theme.light")
      : theme === "dark"
        ? tKey(locale, "theme.dark")
        : tKey(locale, "theme.system");

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setTheme(nextTheme)}
      className="gap-2"
      aria-label="Toggle theme"
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

