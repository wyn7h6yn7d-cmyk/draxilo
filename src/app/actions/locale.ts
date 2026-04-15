"use server";

import { cookies } from "next/headers";

import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/types";
import { toDbLocale } from "@/lib/i18n/db-locale";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function setLocaleAction(formData: FormData) {
  const next = parseLocale(String(formData.get("locale") ?? ""));
  const store = await cookies();
  const locale = next ?? DEFAULT_LOCALE;

  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  // If logged in, persist preference to DB.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, locale: toDbLocale(locale) },
      update: { locale: toDbLocale(locale) },
    });
  }
}

