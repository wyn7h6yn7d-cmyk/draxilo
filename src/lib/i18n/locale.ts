import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "./types";

export const LOCALE_COOKIE = "lf_locale";

export function parseLocale(input: string | undefined | null): Locale | null {
  if (!input) return null;
  const normalized = input.trim().toLowerCase();
  return (LOCALES as readonly string[]).includes(normalized)
    ? (normalized as Locale)
    : null;
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const cookieLocale = parseLocale(store.get(LOCALE_COOKIE)?.value);
  return cookieLocale ?? DEFAULT_LOCALE;
}

