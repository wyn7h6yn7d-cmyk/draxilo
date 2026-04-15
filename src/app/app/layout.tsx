import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getLocale } from "@/lib/i18n/locale";
import { fromDbLocale } from "@/lib/i18n/db-locale";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";
import { ensureProvisionedUser } from "@/lib/provisioning";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) redirect("/login");

  // Ensure DB records exist (user/profile/workspace/membership) for the session.
  const provisioned = await ensureProvisionedUser({
    supabaseUserId: user.id,
    email: user.email,
  });

  // Locale resolution:
  // - If user has a DB locale, prefer it.
  // - Otherwise fall back to cookie-based locale.
  const cookieLocale = await getLocale();
  const dbLocale = fromDbLocale(provisioned.profile.locale);
  const locale = dbLocale ?? cookieLocale;

  // Keep cookie in sync with DB preference.
  if (dbLocale && dbLocale !== cookieLocale) {
    const store = await cookies();
    store.set(LOCALE_COOKIE, dbLocale, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // Shell is provided by nested layouts (e.g. (main)).
  return <>{children}</>;
}

